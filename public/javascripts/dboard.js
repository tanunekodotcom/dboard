//---
// socket.io client
//

/* socket.ioサーバーに接続 */
var socket = io.connect("http://localhost:3000");

/* サーバーとのsocket接続完了時 */
socket.on("connect", function () {});				// 特に何もしない

/* サーバーとのsocket接続切断時 */
socket.on("disconnect", function (client) {});		// 特に何もしない

/* サーバーからの通常メッセージ受信時 */
socket.on("message", function (data) {});			// 特に何もしない

/* サーバーからの情報通知受信時 */
socket.on("c2s_information", function (data) {});	// 特に何もしない

/* サーバー経由で他クライアントからのメッセージ受信時 */
socket.on("s2c_message", function (data) {			// 受信データ=[data → action,id,row,col,class,user_name は固定]

	// ターゲットエレメントを取得（位置情報に齟齬があれば補正する可能性あり→row,cell）
	var tbl = document.getElementById(data.id);
	var row = tbl.rows.item(data.row);
	var cell = row.cells.item(data.col);

	// 通知されたuser_nameと画面が一致しているかを確認
	// （親tr中のtd内でtd_display_nameクラスを持つ要素のvalueをチェック）
	var uname;										// 指定された位置にある実際のuser_name
	var targetrow = document.getElementById(data.id).rows.item($(cell).closest("tr").index());
	for (var i = 0; i < targetrow.cells.length; i++) {
		if ($(targetrow.cells.item(i)).hasClass("td_display_name")) {
			uname = $(targetrow.cells.item(i)).attr("value");
			break;									// 一致しようがしまいが関係ないのでbreak
		}
	}

	// user_nameが一致しない場合（位置が異なるor削除された場合）
	if (uname != data.user_name) {

		// 不正な値が渡されたことをサーバに通知
		putInformation(data, "指定された場所にはuser_nameと一致するデータがありません（実際の値=" + uname + "）");

		// 設定変更後に再読み込みできていない場合などに位置情報が異なることがあるので情報を補正
		// （sortable-tableクラス内のtd内でtd_display_nameクラスを持つ要素のvalueをチェック）
		var tbls = document.getElementsByClassName("sortable-table");
	correction:
		for(var x = 0; x < tbls.length; x++) {
			for (var y = 0, rowLen = tbls[x].rows.length; y < rowLen; y++) {
				for (var z = 0, colLen = tbls[x].rows[y].cells.length; z < colLen; z++) {
					if ($(tbls[x].rows[y].cells.item(z)).hasClass("td_display_name")) {

						// td_display_nameのvalueと一致したらbreak;
						if ($(tbls[x].rows[y].cells.item(z)).attr("value") == data.user_name) {

							// 不正な値が渡されたが補正できたことをサーバに通知
							putInformation(data,
											"指定された場所と異なる位置にuser_nameと一致するデータがありました"
											+ "（id=" + $(tbls[x]).attr("id") + ", row=" + y +"）");

							// ターゲットエレメントを再取得
							var tbl = document.getElementById($(tbls[x]).attr("id"));
							var row = tbl.rows.item(y);
							var cell = row.cells.item(data.col);
							break correction;		// forループの完全終了
						}
					}
				}
			}
		}

		// 不正な値が渡されて補正しようとしたができなかったことをサーバに通知
		if (x > tbls.length) {
			putInformation(data, "指定されたuser_nameは存在しません");
			return;
		}
	}

	// メッセージごとの処理
	switch(data.action) {
		case "turnoverTag_true":	// 在席に（ユーザー名クリック＝名札回転）
			if (data.class == "td_display_name") {
				// class切り替え（バックカラー変更）
				$(cell).toggleClass("td_display_name_true", true);
				$(cell).toggleClass("td_display_name_false", false);
			} else {
				/* 不正な値が渡されたことをサーバに通知 */
				putInformation(data, "指定されたclassが一致しません");
			}
			break;
		case "turnoverTag_false":	// 不在に（ユーザー名クリック＝名札回転）
			if (data.class == "td_display_name") {
				// class切り替え（バックカラー変更）
				$(cell).toggleClass("td_display_name_true", false);
				$(cell).toggleClass("td_display_name_false", true);
			} else {
				/* 不正な値が渡されたことをサーバに通知 */
				putInformation(data, "指定されたclassが一致しません");
			}
			break;
		case "editCell":			// セル値変更（value）
			if (data.class == "td_destination" || data.class == "td_returnplan") {
				// 表示データ変更
				$(cell).text(data.value);
			} else {
				/* 不正な値が渡されたことをサーバに通知 */
				putInformation(data, "指定されたclassが一致しません");
			}
			break;
		default:					// 無視
			break;
	}
});

function putInformation(data, value) {
	socket.json.emit("c2s_information", { 	action: data.action,
											id:data.id,
											row: data.row, col: data.col,
											class: data.class,
											user_name: data.user_name,
											value: value });
}



//---
// window onload時の初期表示およびタイマー更新
//

window.onload = function() {

	// 日付日時を表示
	putCurrentDate(new Date(), "MM/DD (W) hh:mm");

	// 60秒毎に日付時刻を更新
	timerID = setInterval("putCurrentDate(new Date(), 'MM/DD (W) hh:mm')",1000 * 60);
}

/* 日付を更新 */
function putCurrentDate(date, format) {
	wkday = new Array("日","月","火","水","木","金","土");

	// デフォルト書式を設定
	if (!format) format = "YYYY-MM-DD hh:mm:ss";

	// 書式記号を日付時刻で置換
	format = format.replace(/YYYY/g, date.getFullYear());
	format = format.replace(/MM/g, (" " + (date.getMonth() + 1)).substr(-2));
	format = format.replace(/DD/g, (" " + date.getDate()).substr(-2));
	format = format.replace(/W/g,wkday[date.getDay()]);
	format = format.replace(/hh/g, (" " + date.getHours()).substr(-2));
	format = format.replace(/mm/g, ("0" + date.getMinutes()).substr(-2));
	format = format.replace(/ss/g, ("0" + date.getSeconds()).substr(-2));
	document.getElementById("current_date").innerHTML = format;
}



//---
// 行先掲示板のデータ編集
//

$(document).ready(function() {
	$(".destination_board > tbody > tr > td.td_display_name").click(function() {

		var acttion;

		// class切り替え（バックカラー変更）
		if ($(this).hasClass("td_display_name_true")) {
			acttion = "turnoverTag_false";
			$(this).toggleClass("td_display_name_true", false);
			$(this).toggleClass("td_display_name_false", true);
		/* } else if ($(this).hasClass("td_display_name_true")) { */
		} else {
			acttion = "turnoverTag_true";
			$(this).toggleClass("td_display_name_true", true);
			$(this).toggleClass("td_display_name_false", false);
		}

		// ブロードキャスト
		socket.json.emit("c2s_broadcast", { action: acttion,
											id:$(this).closest("tbody").attr("id"),
											row: $(this).closest("tr").index(),
											col: $(this).closest("td").index(),
											class: getValidTdClass(this),
											user_name: $(this).closest("td").attr("value")});
	});
	$(".destination_board > tbody > tr > td.td_destination").click(edit_toggle());
	$(".destination_board > tbody > tr > td.td_returnplan").click(edit_toggle());
});

/* データの編集 */
function edit_toggle() {
	var edit_flag = false;
	return function() {
		if (edit_flag) return;

		// 編集前のデータを記憶
		var org_text = $(this).text();

		// 編集可能に変更
		var $input = $("<input title='tab:入力終了, esc:元に戻す, ctrl+del:データ削除'>").attr("type","text").val(org_text);
		$(this).html($input);

		// キーが押された場合
		$("input", this).keydown(function(e) {
			if (event.ctrlKey) {
				if (e.keyCode == 46) {		// ctrl+del：データ削除
					$(this).val("");
					return false;
				}
			} else {
				if (e.keyCode == 27) {		// esc：元に戻す
					$(this).val(org_text);
					return false;
				}
			}
		});

		// フォーカスを喪失した場合
		$("input", this).focus().blur(function() {

			// 編集前のデータと不一致の場合だけ処理
			if ($(this).val() != org_text) {

				// 対象のdisplay_nameを検索
				var uname;
				var targetrow = document.getElementById($(this).closest("tbody").attr("id")).rows.item($(this).closest("tr").index());
				for (var i = 0; i < targetrow.cells.length; i++) {
					if ($(targetrow.cells.item(i)).hasClass("td_display_name")) {
						uname = $(targetrow.cells.item(i)).attr("value");
						break;
					}
				}

				// ブロードキャスト
				socket.json.emit("c2s_broadcast", { action: "editCell",
													id:$(this).closest("tbody").attr("id"),
													row: $(this).closest("tr").index(),
													col: $(this).closest("td").index(),
													class: getValidTdClass(this.closest("td")),
													user_name: uname,
													value: $(this).val()});
			}
			$(this).after($(this).val()).unbind().remove();
			edit_flag = false;
		});
		edit_flag = true;
	}
}

/* マッチするtdクラスを取得 */
function getValidTdClass(target) {
	var tdclass = [ "td_display_name", "td_destination", "td_returnplan" ];
	for(var c = 0; c < tdclass.length; c++) {
		if ($(target).hasClass(tdclass[c])) {
			return tdclass[c];
		}
	}
	return "";
}




//---
// データメンテナンス
//
$(function() {
	$('.sortable-table').sortable( {
			connectWith: '.sortable-table',
			opacity: 0.5,
			placeholder: '.sortable-table',
			forcePlaceholderSize: true
	});
	$('.sortable-table').disableSelection();
});

