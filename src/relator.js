var grex = require("grex");
var client = grex.createClient();
var gremlin = grex.gremlin;
var g = grex.g;
var async = require("async");
var Chance = require("chance");
var chance = new Chance();
var fs = require('fs');
var settings = {
    host: "localhost",
    port: 8182,
    graph: "graph"
};
var collector = require('./collector.js');
var print = function(x) {
    return console.log(x);
};



// // Relates the user to all of the basics.
var genRelateUser = function(uid, gid, eid, sid) {
    client.connect(settings, function(err, client) {
        var query;
        if (err) {
            console.error(err);
        }
        query = gremlin();
        print(gid);
        var attributeObj = {};
        var user = query.
        var (g.v(uid));
        var gender = query.
        var (g.v(gid));
        var ethnic = query.
        var (g.v(eid));
        var state = query.
        var (g.v(sid));
        // // Grab the all users
        var twit = query.
        var (g.addVertex({
            type: 'twitter',
            value: chance.twitter()
        }));
        var fid = query.
        var (g.addVertex({
            type: 'facebook',
            value: chance.fbid()
        }));
        query(g.addEdge(user, gender, 'is'));
        query(g.addEdge(user, state, 'from'));
        query(g.addEdge(user, ethnic, 'is'));
        query(g.addEdge(user, twit, 'uses'));
        query(g.addEdge(user, fid, 'uses'));
        // check the gender and map that to either male or female
        // sample id from ethnic
        // create twitter name
        // create facebook id
        // Relate ethnics
        // relate twitter id
        // relate facebook id
        client.exec(query, function(err, response) {
            if (!err) {
                print(response);

            } else {
                console.log(err);
            }
        });
    });
};




var preDeterminedRel = function(sub1, sub2, relType) {
    client.connect(settings, function(err, client) {
        var query;
        if (err) {
            console.error(err);
        }
        query = gremlin();
        var attributeObj = {};
        var subject1 = query.
        var (g.v(sub1));

        var subject2 = query.
        var (g.v(sub2));

        query(g.addEdge(subject1, subject2, relType));

        client.exec(query, function(err, response) {
            if (!err) {
                print(response);

            } else {
                console.log(err);
            }
        });
    });
};


var titanTaskhandler = async.cargo(function (tasks, callback) {

    for(var i=0; i<tasks.length; i++){
      if(tasks[i].type === 'u2u'){
        preDeterminedRel(tasks[i].sub1, tasks[i].sub2, tasks[i].rel);

      }
      else if(tasks[i].type === 'gen'){
        genRelateUser(tasks[i].user, tasks[i].gender, tasks[i].ethnic, tasks[i].state);
      }

    }
    callback();
}, 2);

var relMapping = function() {
    // Pull from sets.json
    fs.readFile('./data/sets.json', function(err, value) {
        var data = JSON.parse(value);
        var dMap = data.mappings;
        // print(data.mappin"Vertex 1" + gs);
        for (var i in data.mappings) {
            // Grab the first vertex by filtering type and general value
            // Get V1 id
            var v1 = dMap[i].v1;
            var v1type = v1.ltype;
            var v1Value = v1.value;
            var rel = v1.rtype;
            var v2 = dMap[i].v2;
            var v2type = v2.ltype;
            var v2Value = v2.value;
            var vid1 = collector.getSpecificItem(v1type, v1Value);
            var vid2 = collector.getSpecificItem(v2type, v2Value);
            print(vid1);
            print(vid2);
            // preDeterminedRel();
        }
        // async.map(data.allTypes, dataCollector, done);
    });
};
var sendUserRelations = function() {
    var allUsers = collector.getItemArray("user");
    for (var i = 0, l = allUsers.length; i < l; i++) {
        var u = allUsers[i];
        var ugen = u.value.gender;
        var gen;
        if (ugen === 'Male') {
            gen = collector.getSpecificItem('gender', 'male');
        } else if (ugen === 'Female') {
            gen = collector.getSpecificItem('gender', 'female');
        }
        var e = collector.grabRandomVertex('ethnic');
        var s = collector.grabRandomVertex('state');
        // create the task
        var task = {
          user: u._id,
          gender: gen[0]._id,
          ethnic: e._id,
          state: s._id,
          type: 'gen'
        };
        titanTaskhandler.push(task, function (err) {
          console.log('Task complete');
        });

        // user, gender, ethic, state
        // setTimeout(genRelateUser(u._id, gen[0]._id, e._id, s._id), 1000);
    }
};

// Make each user like stuff
var userToLike = function () {
  var allUsers = collector.getItemArray("user");
  for (var i = 0; i < 5000; i++) {
      var u1 = chance.pick(allUsers);
      var likeList = ["food", "cheese","dAnimals", "wAnimals", "mArtist"];
      var relType = chance.weighted(['like', 'hate', 'loves'], [6, 2, 3]);
      var pickLike = chance.pick(likeList);
      // Like Object - The object you're going to like.
      var lo = collector.grabRandomVertex(pickLike);


      // Create a creation task
      var task = {
        sub1: u1._id,
        sub2: lo._id,
        rel: relType,
        type: 'gen'
      };

      // push creation task to titanTaskhandler
      titanTaskhandler.push(task, function (err) {
        console.log('Finish Processing Task');
      });

  }
};

var userToUser = function() {
    var allUsers = collector.getItemArray("user");
    for (var i = 0; i < 5000; i++) {
        var u1 = chance.pick(allUsers);
        var u2 = chance.pick(allUsers);
        var u1Gender = u1.value.gender;
        var u2Gender = u2.value.gender;
        var u1Age = u1.value.age;
        var u2Age = u2.value.age;
        var ageDiff = u1Age - u2;
        if (ageDiff < 0) {
            ageDiff = ageDiff * -1;
        }
        // Checks
        // Check 2: What age are these people? Are they above 18
        var relType;
        // Check 1: Are these people different genders
        if (u1Gender !== u2Gender && ageDiff <= 10 && u1Age >= 18 && u2Age >= 18) {
            // If so, consider either dating, loves or marriage
            relType = chance.weighted(['dating', 'loves', 'marriage', 'hates', 'likes', 'friends'], [2, 2, 1, 4, 2, 4, 3]);
        }
        else{
            relType = chance.weighted(['hates', 'likes', 'friends'], [2, 4, 3]);
        }

        // Create a creation task
        var task = {
          sub1: u1._id,
          sub2: u2._id,
          rel: relType,
          type: 'u2u'
        };
        var task2 = {
          sub1: u1._id,
          sub2: u2._id,
          rel: 'knows',
          type: 'u2u'
        };
        // push creation task to titanTaskhandler
        titanTaskhandler.push(task, function (err) {
          console.log('Finish Processing Task');
        });
        titanTaskhandler.push(task2, function (err) {
          console.log('Finish Processing Task');
        });
    }


};




exports.killEdges = function() {
    client.connect(settings, function(err, client) {
        var query;
        if (err) {
            console.error(err);
        }
        query = gremlin();
        query(g.E().remove());
        query(g.V('type', 'twitter').remove());
        query(g.V('type', 'facebook').remove());
        client.exec(query, function(err, response) {
            if (!err) {
                print(response);
            } else {
                console.log(err);
            }
        });
    });
};




var randomConnections = function() {
    var allUsers = collector.getItemArray("user");
};



// ------------------------------------------------------
// Runs Relation Task
// ------------------------------------------------------
exports.runRelations = function() {
    // relMapping();
    sendUserRelations();
    userToUser();
};



// Relates the user to all of the basics.
