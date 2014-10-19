var chai = require('chai');
var should = chai.should();
var grex = require("grex");
var client = grex.createClient();
var gremlin = grex.gremlin;
var g = grex.g;
var reader = require('./collector.js');
var async = require("async");
var chance = require("chance");
var fs = require('fs');
var settings = {
    host: "localhost",
    port: 8182,
    graph: "graph"
};
var secrets = {
    api_key: process.env.LASTFM_KEY || 'c8c0ea1c4a6b199b3429722512fbd17f',
    secret: process.env.LASTFM_SECRET || 'is cb7857b8fba83f819ea46ca13681fe71'
};
var LastFmNode = require("lastfm").LastFmNode;
var Chance = require("chance");
var chance = new Chance();
var low = require("lowdb");
var db = low("./data/fakeData.json");
var util = require('util');
var relator = require('./relator.js');
var print = function(x) {
    return console.log(x);
};
var createUser = function() {
    var mf, user;
    mf = chance.gender();
    user = {
        first: chance.first({
            gender: mf
        }),
        last: chance.last(),
        age: chance.age(),
        gender: mf,
        single: true
    };
    return user;
};
/**
  The arrObj stands for array object. It holds the list type
**/
var addAttribute = function(arrObj) {
    client.connect(settings, function(err, client) {
        var query;
        if (err) {
            console.error(err);
        }
        query = gremlin();
        var listType = util.format('%s', arrObj.ltype);
        var attributeObj = {};
        for (var i in arrObj.arr) {
            attributeObj.type = arrObj.ltype;
            attributeObj.value = arrObj.arr[i];
            query(g.addVertex(attributeObj));
        }
        client.exec(query, function(err, response) {
            if (!err) {
                print(response);
            } else {
                console.log(err);
            }
        });
    });
};

function addObj(userObj) {
    client.connect(settings, function(err, client) {
        var query;
        if (err) {
            console.error(err);
        }
        query = gremlin();
        query(g.addVertex(userObj));
        client.exec(query, function(err, response) {
            if (!err) {
                print(response);
            } else {
                console.log(err);
            }
        });
    });
}

function done(err, end) {
    console.log(end);
}
var runGenAtt = function() {
    fs.readFile("./data/sets.json", function(err, value) {
        var data = JSON.parse(value);
        async.map(data.objects, addAttribute, done);
    });
};
var createArtist = function() {
    var lastfm;
    lastfm = new LastFmNode(secrets);
    async.auto({
        get_data: function(callback) {
            lastfm.request("chart.getTopArtists", {
                handlers: {
                    success: function(data) {
                        callback(null, data.artists.artist);
                    },
                    error: function(err) {
                        callback(null, err);
                    }
                }
            });
        },
        addToTitan: ["get_data",
            function(callback, results) {
                client.connect(settings, function(err, client) {
                    var query;
                    if (err) {
                        console.error(err);
                    }
                    query = gremlin();
                    for (var i in results.get_data) {
                        var artistObj = {
                            type: 'mArtist',
                            value: results.get_data[i].name
                        };
                        query(g.addVertex(artistObj));
                    }
                    client.exec(query, function(err, response) {
                        if (!err) {
                            print("Attributes Added");
                            callback(null, "Success");
                        } else {
                            print("Objects not added\nErr: " + err + "\n");
                            callback(null, err);
                        }
                    });
                });
            }
        ]
    }, function(err, results) {
        if (err) {
            console.log("The Program Failed\n\n" + err);
        } else {
            console.log("Data created");
        }
    });
};
var stateCreator = function() {
    fs.readFile("./data/sets.json", function(err, value) {
        var data = JSON.parse(value);
        var state = data.states;
        for (var l in state) {
            var stateObj = {
                type: 'state',
                value: state[l].abbreviation,
                long: state[l].name
            };
            addObj(stateObj);
        }
    });
};
var newUsers = function(peopleNum) {
    for (var i = 0; i < peopleNum; i++) {
        var attributeObj = {};
        attributeObj.type = 'user';
        attributeObj.value = createUser();
        addObj(attributeObj);
    }
};
exports.createAll = function() {
    reader.deleteAll();
    createArtist();
    stateCreator();
    runGenAtt();
    newUsers(200);
};
