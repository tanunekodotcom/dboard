/**---
 * Instantiable modules
 */

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');



/**---
 * Conneted database
 */

var db = mongoose.connect('mongodb://localhost/dboard');



/**---
 * define schema
 */

var user = new mongoose.Schema({
	_id:			{ type: String, required: 'Please enter your ID', unique: true },
	user_name:		{ type: String },
	email:			{ type: String, required: 'Please enter your e-mail address.' },
	password:		{ type: String },
	first_name:		{ type: String },
	last_name:		{ type: String },
	create_at:		{ type: Date },
	update_at:		{ type: Date }
});
user.plugin(uniqueValidator, { message: 'It is already registered.' });



var destinationdata = new mongoose.Schema({
	_id:			{ type: String, required: 'Please enter your ID', unique: true },
	display_name:	{ type: String, required: 'Please enter your display name' },
	enrolled:		{ type: String },
	destination:	{ type: String },
	returnplan:		{ type: String },
	create_at:		{ type: Date },
	update_at:		{ type: Date }
});
destinationdata.plugin(uniqueValidator, { message: 'It is already registered.' });



var listposition = new mongoose.Schema({
	"row" : 		{ type: Number },
	"col" : 		{ type: Number },
	"_id" : 		{ type: String, ref: 'destinationdata' }
});
var board = new mongoose.Schema({
	_id:			{ type: String, required: 'Please enter board ID', unique: true },
	board_name:		{ type: String, required: 'Please enter board name' },
	list_pattern:	[ listposition ]
});



/**---
 * Export schema
 */

exports.user = db.model('user', user);
exports.destinationdata = db.model('destinationdata', destinationdata);
exports.board = db.model('board', board);

