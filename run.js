#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program   = require('commander');
var relator   = require('./src/relator.js');
var creator   = require('./src/creator.js');
var collector = require('./src/collector.js');


program
  .version('0.0.1')
  .option('-c, --createv', 'Add the vertcies to the database.')
  .option('-C, --collectv', 'Collect all  of the Vertex')
  .option('-r, --creater', 'Add the relations to the database.')
  .option('-R, --collectr', 'Collect all of the relations')
  .option('-d, --deleteEdges', 'Deletes all of the edges in the database')
  .option('-k, --deleteDB', 'Deletes the entire database. Edges and all.')
  .parse(process.argv);


// if (program.args.length === 0) {
//   console.log("Enter some commands");
// }

var formatStrings =  {
  tab1 : "\t",
  tab2 : "\t\t",
  tab3 : "\t\t\t",
  tab4 : "\t\t\t\t"
};

if (program.rawArgs.length <= 2) {
  var fs = formatStrings;
  console.log("--" + fs.tab1 + "----------------------------------"   + fs.tab1 + "--");
  console.log(fs.tab1 + "--" + fs.tab4 + fs.tab1 + "--");
  console.log(fs.tab1 + "--" + fs.tab4 + fs.tab1 + "--");
  console.log(fs.tab2 + "You have to enter a command");
  console.log(fs.tab1 + "--" + fs.tab4 + fs.tab1 + "--");
  console.log(fs.tab1 + "--" + fs.tab4 + fs.tab1 + "--");
  console.log("--" + fs.tab1 + "----------------------------------"   + fs.tab1 + "--");
}
if (program.createv) {
  creator.createAll();
  }
if (program.creater) 	{
	relator.runRelations();
	console.log(' - create relations');
}
if (program.collectr){
	collector.runEdgeCollector();
}
if (program.collectv) {
	collector.runVertexCollector();
	console.log(' - create relations');
}
if(program.deleteEdges){
  console.log('Deleting all of the edges');
  relator.killEdges();
}

if(program.deleteDB){
  collector.deleteAll();
}
