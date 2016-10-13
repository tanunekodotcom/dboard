/**---
 * Instance of modules and initialize
 */

var dboarddb = require("../models/dboarddb");
var destinationdata = dboarddb.destinationdata;						// load schema



/**---
 * Event for socket-connetion
 */
var myroom = "share-room";							// デフォルトroom
var dboardio = function(io, socket) {				// 受信データ=[data → action,id,row,col,class,user_name は固定]

	/* クライアント接続時 */
	socket.join(myroom);							// デフォルトroomに参加
	console.log("[log] connected... " + socket.id);

	/* クライアントからのメッセージ受信時（全クライアント指定） */
	socket.on("c2s_message", function(data) {

		// 受信ログ
		console.log("[message] socket=" + socket.id
							+ ",act=" + data.action + ",id=" + data.id
							+ ",row=" + data.row + ",col=" + data.col
							+ ",cls=" + data.class + ",usr=" + data.user_name);

		// 全クライアントにメッセージを折り返し
		io.sockets.to(myroom).emit("s2c_message", data);

		// データベースを更新
		updateDatabase(data);
	});

	/* クライアントからのメッセージ受信時（他クライアント指定） */
	socket.on("c2s_broadcast", function(data) {

		// 受信ログ
		console.log("[broadcast] socket=" + socket.id
							+ ",act=" + data.action + ",id=" + data.id
							+ ",row=" + data.row + ",col=" + data.col
							+ ",cls=" + data.class + ",usr=" + data.user_name);

		// 他クライアントにメッセージを折り返し
		socket.broadcast.to(myroom).emit("s2c_message", data);

		// データベースを更新
		updateDatabase(data);
	});

	/* クライアントからのメッセージ受信時（情報通知指定） */
	socket.on("c2s_information", function(data) {

		// 受信ログ
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

	// メッセージごとの処理
	switch(data.action) {
		case "turnoverTag_true":	// 在席に（ユーザー名クリック＝名札回転）
			// enrolledを更新
			destinationdata.update( { _id: data.user_name }, { $set: { enrolled: "true" } }, function(err) {
				if (!err) {
					console.log("[db.update] : success");
				} else {
					console.log("[db.update] : " + err);
				}
			});
			break;
		case "turnoverTag_false":	// 不在に（ユーザー名クリック＝名札回転）
			// enrolledを更新
			destinationdata.update( { _id: data.user_name }, { $set: { enrolled: "false" } }, function(err) {
				if (!err) {
					console.log("[db.update] : success");
				} else {
					console.log("[db.update] : " + err);
				}
			});
			break;
		case "editCell":		// セル値変更（value）
			// destination/returnplan/remarksを更新
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
