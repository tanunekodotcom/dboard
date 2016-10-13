/**---
 * Instance of modules and initialize
 */

var dboarddb = require("../models/dboarddb");
var destinationdata = dboarddb.destinationdata;						// load schema



/**---
 * Event for socket-connetion
 */
var myroom = "share-room";							// �f�t�H���groom
var dboardio = function(io, socket) {				// ��M�f�[�^=[data �� action,id,row,col,class,user_name �͌Œ�]

	/* �N���C�A���g�ڑ��� */
	socket.join(myroom);							// �f�t�H���groom�ɎQ��
	console.log("[log] connected... " + socket.id);

	/* �N���C�A���g����̃��b�Z�[�W��M���i�S�N���C�A���g�w��j */
	socket.on("c2s_message", function(data) {

		// ��M���O
		console.log("[message] socket=" + socket.id
							+ ",act=" + data.action + ",id=" + data.id
							+ ",row=" + data.row + ",col=" + data.col
							+ ",cls=" + data.class + ",usr=" + data.user_name);

		// �S�N���C�A���g�Ƀ��b�Z�[�W��܂�Ԃ�
		io.sockets.to(myroom).emit("s2c_message", data);

		// �f�[�^�x�[�X���X�V
		updateDatabase(data);
	});

	/* �N���C�A���g����̃��b�Z�[�W��M���i���N���C�A���g�w��j */
	socket.on("c2s_broadcast", function(data) {

		// ��M���O
		console.log("[broadcast] socket=" + socket.id
							+ ",act=" + data.action + ",id=" + data.id
							+ ",row=" + data.row + ",col=" + data.col
							+ ",cls=" + data.class + ",usr=" + data.user_name);

		// ���N���C�A���g�Ƀ��b�Z�[�W��܂�Ԃ�
		socket.broadcast.to(myroom).emit("s2c_message", data);

		// �f�[�^�x�[�X���X�V
		updateDatabase(data);
	});

	/* �N���C�A���g����̃��b�Z�[�W��M���i���ʒm�w��j */
	socket.on("c2s_information", function(data) {

		// ��M���O
		console.log("[information] socket=" + socket.id
							+ ",act=" + data.action + ",id=" + data.id
							+ ",row=" + data.row + ",col=" + data.col
							+ ",cls=" + data.class + ",usr=" + data.user_name
							+ " ... " + data.value);
	});

	// disconnet
	socket.on("disconnect", function() {
		console.log("[log] disconnected... " + socket.id);
	});
};

/* update database */
function updateDatabase(data) {

	// ���b�Z�[�W���Ƃ̏���
	switch(data.action) {
		case "turnoverTag_true":	// �ݐȂɁi���[�U�[���N���b�N�����D��]�j
			// enrolled���X�V
			destinationdata.update( { _id: data.user_name }, { $set: { enrolled: "true" } }, function(err) {
				if (!err) {
					console.log("[db.update] : success");
				} else {
					console.log("[db.update] : " + err);
				}
			});
			break;
		case "turnoverTag_false":	// �s�݂Ɂi���[�U�[���N���b�N�����D��]�j
			// enrolled���X�V
			destinationdata.update( { _id: data.user_name }, { $set: { enrolled: "false" } }, function(err) {
				if (!err) {
					console.log("[db.update] : success");
				} else {
					console.log("[db.update] : " + err);
				}
			});
			break;
		case "editCell":		// �Z���l�ύX�ivalue�j
			// destination/returnplan/remarks���X�V
			if (data.class == "td_destination") {
				destinationdata.update( { _id: data.user_name }, { $set: { destination: data.value } }, function(err) {
					if (!err) {
						console.log("[db.update] : success");
					} else {
						console.log("[db.update] : " + err);
					}
				});
			} else if (data.class == "td_returnplan") {
				destinationdata.update( { _id: data.user_name }, { $set: { returnplan: data.value } }, function(err) {
					if (!err) {
						console.log("[db.update] : success");
					} else {
						console.log("[db.update] : " + err);
					}
				});
			} else {
				console.log("[db.update] : Illegal request has been ... action=" + data.action + ", class=" + data.class);
				return false;
			}
	}
}



/**---
 * Export application module
 */

module.exports = dboardio;
