$(function () {
  let devPeer = null;
  let peer = null;
  let room = null;
  let existingCall = null;
  let localStream = null;

  devPeer = new Peer({
    key: '509e8d12-793a-4daa-90c4-f077b66b066b',
    debug: 3
  });
  debugger;

  peer = new Peer({
    key: '509e8d12-793a-4daa-90c4-f077b66b066b',
    debug: 3
  });


  peer.on('open', function () {
    console.log('peerIDを発行しました');
    $('#my-label').text(peer.id);
  });

  peer.on('error', function (err) {
    alert(err.message);
  });

  peer.on('close', function () {
    console.log('相手との接続が切れました。');
  });



  function myVideoSetUp() {

    navigator.mediaDevices.getUserMedia({ video: { width: 580, height: 326 }, audio: true })
      .then(function (stream) {
        $('#my-video').get(0).srcObject = stream;
        localStream = stream;
        if (room) {
          room.replaceStream(stream);
          return;
        }
      }).catch(function (error) {
        console.error('mediaDevice.getUserMedia() error:', error);
        return;
      });
  }

  function conect(room) {
    room.on('stream', s => {
      const el = $('#videoOther').find('video').get(0);
      el.srcObject = s;
      el.play();
    });

    room.on('removeStream', s => {
      const peerId = s.peerId;
    });

    room.on('peerJoin', s => {
      console.log(s);

    });
  }

  function message(msg) {
    $('#showMsg').append('<p>' + msg + '</p>');
  }

  // roomにアクセス
  $('#access').on('click', e => {
    myVideoSetUp();
    // e.preventDefault();
    const roomName = $('#roomName').val();

    $('.overFlow').hide();
    // roomNameが未入力の場合ウォッチ終了
    if (!roomName) {
      return;
    }

    $('#roomTtl').text('ルームネーム  :  ' + roomName);
    debugger;
    devRoom = devPeer.joinRoom(roomName, { mode: 'sfu', stream: localStream });
    room = peer.joinRoom(roomName, { mode: 'sfu', stream: localStream });
    conect(devRoom);
    conect(room);

    //チャット機能
    //送る
    $('#sendMsg').on('click', () => {
      let d = new Date();
      let h = d.getHours();
      let m = d.getMinutes();
      let s = d.getSeconds();
      let time = h + ':' + m + ':' + s;
      let msg = $('#inputMsg').val();

      let o = {
        sendTime: time,
        cont: msg
      }
      room.send(o);

      message('自分> ' + o.cont + '  |  ' + o.sendTime);
      $('#inputMsg').val("");
    });

    $('#timeSend').on('click', e => {
      let timerNumber = $('#timeInput').val();
      if ($.isNumeric(timerNumber)) {
        room.send(timerNumber);
        $('#timer').attr('data-minutes-left', timerNumber);
        $('#timeInputBox').hide();
        $('#timer').startTimer({
          onComplete: function (element) {
            $('#timeInputBox').show();
            $('#timer').empty();
          }
        });
      } else {
        alert('半角数字でお願いします。');
        $('#timeInput').val("");
      }
    });

    // 受信
    room.on('data', d => {
      if (d.data === null) {
        $('#timer').attr('data-minutes-left', d.time);
        $('#timeInputBox').hide();
        $('#timer').startTimer({
          onComplete: function (element) {
            $('#timeInputBox').show();
            $('#timer').empty();
          }
        });
      } else {
        message('ユーザーname: ' + d.src + '> ' + d.data + '  |  ' + d.time);
      }
    });


  });

  $('#mainBtn').on('click', e => {
    $('#video-container').addClass('zindex');
    $('#msgCont').removeClass('zindex');
    $('#specificationCont').removeClass('zindex');
  });

  $('#msgBtn').on('click', e => {
    $('#msgCont').addClass('zindex');
    $('#video-container').removeClass('zindex');
    $('#specificationCont').removeClass('zindex');
  })

  $('#specificationBtn').on('click', e => {
    $('#specificationCont').addClass('zindex');
    $('#msgCont').removeClass('zindex');
    $('#video-container').removeClass('zindex');
  });

  $('#specification_00').on('click', e => {
    $('#specification__flexBox00').css('display', 'flex');
    $('#specificationCont').find('button').hide();
  });

  $('#specification_01').on('click', e => {
    $('#specification__flexBox01').css('display', 'flex');
    $('#specificationCont').find('button').hide();
  });

  $('#specification_02').on('click', e => {
    $('#specification__flexBox02').css('display', 'flex');
    $('#specificationCont').find('button').hide();
  });
});


//ss機能

const ss = ScreenShare.create({ debug: true });

$(function () {
  $('#start-screen').on('click', () => {
    if (ss.isScreenShareAvailable() === false) {
      alert('Screen Share cannot be used. Please install the Chrome extension.');
      return;
    }

    ss.start({
      width: 320,
      height: 180,
      frameRate: 30,
    })
      .then(stream => {
        $('#my-video')[0].srcObject = stream;

        if (existingCall !== null) {
          const peerid = existingCall.peer;
          existingCall.close();
          const call = peer.call(peerid, stream);
          step3(call);
        }
        localStream = stream;
      })
      .catch(error => {
        console.log(error);
      });
  });
});