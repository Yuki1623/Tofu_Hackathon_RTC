$(function () {
  let peer = null;
  let room = null;
  let existingCall = null;
  let localStream = null;
  let closeRoom = null;
  let firstConect = false;
  let userName = null;

  const ss = ScreenShare.create({ debug: true });

  peer = new Peer({
    key: '509e8d12-793a-4daa-90c4-f077b66b066b',
    debug: 3
  });

  peer.on('open', function () {
    console.log('peerIDを発行しました');
  });

  peer.on('error', function (err) {
    alert(err.message);
  });

  peer.on('close', function () {
    console.log('相手との接続が切れました。');
  });

  const myVideoSetUp = () => {
    firstConect = true;
    navigator.mediaDevices.getUserMedia({ video: { width: 1600, height: 900 }, audio: true })
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

  const conect = room => {
    room.on('stream', s => {
      $('#videoOther').find('video').get(0).srcObject = s;
      $('#videoOther').find('video').get(0).play();
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
      } else if (d.data === true && d.time === true) {
        if (firstConect === true) {
          $('#conectCont').css('display', 'flex');
          $('#conectUser').html(s);
          firstConect = false;
        }
      } else {
        message('ユーザーname: ' + d.src + '> ' + d.data + '  |  ' + d.time);
      }
    });

    room.on('removeStream', s => {
      const peerId = s.peerId;
    });

    room.on('peerJoin', s => {
      if (firstConect === true) {
        $('#conectCont').css('display', 'flex');
        $('#conectUser').html(s);
        firstConect = false;
      }
    });
  }

  const message = msg => {
    $('#showMsg').append('<p>' + msg + '</p>');
  }

  const ssStart = object => {
    ss.start(object).then(s => {
      $('#my-video').get(0).srcObject = s;
      localStream = s;
      room = peer.joinRoom('sfu_video_' + roomName, { mode: 'sfu', stream: localStream });
      $('.video').addClass('displayCenter');
      $('.video').removeClass('normal');
    }).catch(error => {
      console.log(error);
    });
  };

  $('#goConect').on('click', () => {
    room.send(true);
    room.close();
    $('.mainDisplay').show();
    $('#conectCont').hide();
    room = peer.joinRoom('sfu_video_' + roomName, { mode: 'sfu', stream: localStream });
    conect(room);
  });

  $('#start-screen').on('click', () => {
    room.close();
    if (ss.isScreenShareAvailable() === false) {
      alert('Screen Share cannot be used. Please install the Chrome extension.');
      return;
    }
    ssStart({
      width: 1600,
      height: 900,
      frameRate: 30,
    });
    conect(room);
  });

  $('#myFace').on('click', () => {
    myVideoSetUp();
    $('.video').addClass('center');
    $('.video').removeClass('displayCenter');
  });

  $('#onemore').on('click', () => {
    room.close();
    room = peer.joinRoom('sfu_video_' + roomName, { mode: 'sfu', stream: localStream });
    conect(room);
  });

  $('#stopRoom').on('click', () => {
    room.close();
    $('#roomName').val("");
    $('.overFlow').show();
  });

  // roomにアクセス
  $('#access').on('click', e => {
    myVideoSetUp();
    e.preventDefault();
    const roomName = $('#roomName').val();

    $('.overFlow').hide();
    if (!roomName) {
      return;
    }

    $('#roomTtl').text('ルームネーム  :  ' + roomName);
    room = peer.joinRoom('sfu_video_' + roomName, { mode: 'sfu', stream: localStream });
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