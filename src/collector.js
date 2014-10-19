// This class collects data from the database and sends it to a lowdb json file.
var fs = require('fs');
var grex = require("grex");
var client = grex.createClient();
var gremlin = grex.gremlin;
var g = grex.g;
var settings = {
    host: "localhost",
    port: 8182,
    graph: "graph"
};
var async = require("async");
var low = require("lowdb");
var dbv = low('./data/vertex.json');
var dbe = low('./data/edge.json');
var Q = require('q');
// Read the sets.json
var print = function(x) {
    return console.log(x);
};

function saveToLow(typeString, resultsObj) {
    // Used to save all verticies by typeString
    // Results will be coming from the dataCollector
    var newTypeString = String(typeString); // Keep the typeSting in String format
    dbv(newTypeString).push(resultsObj);
    dbv.save();
}

function dataCollector(type, callback) {
    client.connect(settings, function(err, client) {
        var query;
        if (err) {
            console.error(err);
        }
        query = gremlin();
        var typeString = String(type);
        query(g.V("type", typeString));
        client.exec(query, function(err, response) {
            if (!err) {
                print("Something is working.");
                callback(null, response);
            } else {
                print("Object not found\nErr: " + err + "\n");
                callback(null, err);
            }
        });
    });
}

function done(err, end) {
    console.log(end);
    for (var i = 0, l = end.length; i < l; i++) {
        // console.log(results[i].results);
        if (end[i].results.length === 0) {
            console.log("No Good");
        } else {
            setTimeout(saveToLow(end[i].results[0].type, end[i].results), 1500);
        }
    }
}

function doneDelete(err, end) {
    console.log(end);
}
exports.runVertexCollector = function() {
    fs.readFile('./data/sets.json', function(err, value) {
        var data = JSON.parse(value);
        // console.log(data);
        async.map(data.allTypes, dataCollector, done);
    });
};
exports.runEdgeCollector = function() {
    client.connect(settings, function(err, client) {
        var query;
        if (err) {
            console.error(err);
        }
        query = gremlin();
        query(g.E());
        client.exec(query, function(err, response) {
            if (!err) {
                dbe('edges').push(response.results);
                dbe.save();
            } else {
                print("Object not added\nErr: " + err + "\n");
            }
        });
    });
};

exports.deleteAll = function() {
    client.connect(settings, function(err, client) {
        var query;
        if (err) {
            console.error(err);
        }
        query = gremlin();
        query(g.V().remove());
        query(g.E().remove());
        client.exec(query, function(err, response) {
            if (!err) {
                async.map(['./data/edge.json', './data/vertex.json'], fs.unlink, doneDelete);
            } else {
                print("Object not added\nErr: " + err + "\n");
            }
        });
    });
};
// Grabs a random vertex by a specific type
exports.grabRandomVertex = function(type) {
    var vertex = dbv(type).sample().sample().value();
    console.log(vertex);
    return vertex;
};
// Gets list of items of a specific type
exports.getItemArray = function(type) {
    var vertexArr = dbv(type).sample().value();
    return vertexArr;
};
exports.getSpecificItem = function(type, val) {
    var vertexArr = dbv(type).sample().where({
        value: val
    }).value();
    // print(vertexArr);
    return vertexArr;
};
// grabRandomVertex('user');
// runFullCollector();
// runVertexCollector();
// fs.readFile('./sets.json', function (err, value) {
//     console.log(value);
//     // var data = JSON.parse(value);
//     // async.map(data.allTypes, dataCollector, done);
//   });