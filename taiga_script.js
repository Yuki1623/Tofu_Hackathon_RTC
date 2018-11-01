$(function () {
  let peer = null;
  let room = null;
  let existingCall = null;
  let localStream = null;

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

    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 180 }, audio: true })
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
    console.log(room);
    room.on('stream', s => {
      const peerId = s.peerId;
      const id = 'video_' + peerId + '_' + s.id.replace('{', '').replace('}', '');
      const el = $('#videoOther').find('video').get(0);
      el.srcObject = s;
      el.play();
    });

    room.on('removeStream', s => {
      const peerId = s.peerId;
      $('#video_' + peerId + '_' + s.id.replace('{', '').replace('}', '')).remove();
    });

    room.on('peerJoin', s => {
      console.log(s);
    });
  }

  // roomにアクセス
  $('#access').on('click', e => {
    myVideoSetUp();
    e.preventDefault();
    const roomName = $('#roomName').val();

    $('.overFlow').hide();
    // roomNameが未入力の場合ウォッチ終了
    if (!roomName) {
      return;
    }

    $('#roomTtl').text(roomName);
    room = peer.joinRoom(roomName, { mode: 'sfu', stream: localStream });
    conect(room);
  });

});