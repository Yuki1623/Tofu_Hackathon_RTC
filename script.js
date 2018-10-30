// peerオブジェクト
$('#makeName').on('click', function () {
    const $myName =$('#inputMyName').val();
    $('#overflow').remove();
    const peer = new Peer($myName,{
        key: '509e8d12-793a-4daa-90c4-f077b66b066b', // 自分のAPIキーを入力
        debug: 3
    });
    // 入室
    let room = null;
    $('#join').click(function () {
        room = peer.joinRoom($('#roomName').val(), { mode: 'sfu' });
        chatlog('<i>' + $('#roomName').val() + '</i>に入室しました');
        chatlog('きましたよ。');
        // チャットを送信
        $('#send').click(function () {
            var msg = $('#msg').val();
            debugger;
            room.send(msg);
            chatlog('自分> ' + msg);
            $('#msg').val("");
        });

        // チャットを受信
        room.on('data', function (data) {
            chatlog('ID: ' + data.src + '> ' + data.data); // data.src = 送信者のpeerid, data.data = 送信されたメッセージ
        });
    });

    // 退室
    $('#leave').click(function () {
        room.close();
        chatlog('<i>' + $('#roomName').val() + '</i>から退室しました');
    })


    // チャットログに記録するための関数
    function chatlog(msg) {
        $('#chatLog').append('<p>' + msg + '</p>');
    }
 });



