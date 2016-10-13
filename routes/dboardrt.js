/**---
 * Instance of modules and initialize
 */

var express = require("express");
var dboardrt = express.Router();							// make routeing handler

var dboarddb = require("../models/dboarddb");
//var user = dboarddb.user;									// load user schema
var destinationdata = dboarddb.destinationdata;				// load destinationdata schema
var board = dboarddb.board;									// load board schema



/**---
 * Request for routing-process
 */

// for normal
dboardrt.get("/", function(req, res) {
//	board.find({}, {},{}, function(err, boards) {
//		if(err) throw new Error(err);
//
//		console.log("length=" + boards.length);
//
//		for(var i = 0; i < boards.length; i++) {
//			console.log("i=" + i + ", _id=" + boards[i]._id + ", board_name=" + boards[i].board_name + ", length=" + boards[i].list_pattern.length);
//			for(var j = 0; j < boards[i].list_pattern.length; j++) {
//				console.log("j=" + j + ", row=" + boards[i].list_pattern[j].row + ", col=" + boards[i].list_pattern[j].col + ", _id=" + boards[i].list_pattern[j]._id);
//			}
//		}
//		console.log("exit");
//	});
	board.find()
		.populate('list_pattern._id')
		.exec(function(err, boards) {
			if (!err) {
				console.log("[db.find] : board and destinationdata - success");
				res.render("dboardview", { boards: boards,
											max_row: 22,
											table_number: 2 });
				console.log(boards[0].list_pattern[0]._id.display_name);
			}
		});
});



/**---
 * Export application module
 */

module.exports = dboardrt;
