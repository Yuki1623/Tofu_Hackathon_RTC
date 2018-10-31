/* eslint-disable require-jsdoc */
$(function () {

  $('#makeName').on('click', () => {
    const $myName = $('#inputMyName').val();
    $('#overflow').hide();
    // Peer object
    const peer = new Peer($myName,{
      key: '509e8d12-793a-4daa-90c4-f077b66b066b',
      debug: 3,
    });
  
    let localStream;
    let room;
    peer.on('open', () => {
      $('#my-id').text(peer.id);
    });
  
    peer.on('error', err => {
      alert(err.message);
      $('#overflow').show();
      $('#makeName').val('');
    });
  
    $('#make-call').on('submit', e => {
      step1();
      e.preventDefault();
      // Initiate a call!
      const roomName = $('#join-room').val();
      if (!roomName) {
        return;
      }
      room = peer.joinRoom(roomName, { mode: 'sfu', stream: localStream });
  
      $('#room-id').text(roomName);
      step3(room);
      chatlog('入室しました');
    });
  
    $('#end-call').on('click', () => {
      room.close();
      step2();
    });
  
    // Retry if getUserMedia fails
  
    // set up audio and video input selectors
    const audioSelect = $('#audioSource');
    const videoSelect = $('#videoSource');
    const selectors = [audioSelect, videoSelect];
  
    navigator.mediaDevices.enumerateDevices()
      .then(deviceInfos => {
        const values = selectors.map(select => select.val() || '');
        selectors.forEach(select => {
          const children = select.children(':first');
          while (children.length) {
            select.remove(children);
          }
        });
  
        for (let i = 0; i !== deviceInfos.length; ++i) {
          const deviceInfo = deviceInfos[i];
          const option = $('<option>').val(deviceInfo.deviceId);
  
          if (deviceInfo.kind === 'audioinput') {
            option.text(deviceInfo.label ||
              'Microphone ' + (audioSelect.children().length + 1));
            audioSelect.append(option);
          } else if (deviceInfo.kind === 'videoinput') {
            option.text(deviceInfo.label ||
              'Camera ' + (videoSelect.children().length + 1));
            videoSelect.append(option);
          }
        }
  
        selectors.forEach((select, selectorIndex) => {
          if (Array.prototype.slice.call(select.children()).some(n => {
            return n.value === values[selectorIndex];
          })) {
            select.val(values[selectorIndex]);
          }
        });
  
        videoSelect.on('change', step1);
        audioSelect.on('change', step1);
      });
  
    function step1() {
      // Get audio/video stream
      const audioSource = $('#audioSource').val();
      const videoSource = $('#videoSource').val();
      const constraints = {
        audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
        video: { deviceId: videoSource ? { exact: videoSource } : undefined },
      };
  
      navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        $('#my-video').get(0).srcObject = stream;
        localStream = stream;
  
        if (room) {
          room.replaceStream(stream);
          return;
        }
  
        step2();
      }).catch(err => {
        $('#step1-error').show();
        console.error(err);
      });
    }
  
    function step2() {
      $('#their-videos').empty();
      $('#step1, #step3').hide();
      $('#step2').show();
      $('#join-room').focus();
    }
  
    function step3(room) {
      // Wait for stream on the call, then set peer video display
      room.on('stream', stream => {
        debugger;
        const peerId = stream.peerId;
        const id = 'video_' + peerId + '_' + stream.id.replace('{', '').replace('}', '');
  
        $('#their-videos').append($(
          '<div class="video_' + peerId + '" id="' + id + '">' +
          '<label>' + stream.peerId + ':' + stream.id + '</label>' +
          '<video class="remoteVideos" autoplay playsinline>' +
          '</div>'));
        const el = $('#' + id).find('video').get(0);
        el.srcObject = stream;
        el.play();
      });
  
      room.on('removeStream', stream => {
        const peerId = stream.peerId;
        $('#video_' + peerId + '_' + stream.id.replace('{', '').replace('}', '')).remove();
      });
  
      // UI stuff
      room.on('close', step2);
      room.on('peerLeave', peerId => {
        $('.video_' + peerId).remove();
      });
      // $('#step1, #step2').hide();
      // $('#step3').show();

      room.on('data', function (data) {
        chatlog('ユーザーname: ' + data.src + '> ' + data.data + '  |  ' + data.time); // data.src = 送信者のpeerid, data.data = 送信されたメッセージ
      });
    }
    $('#send').click(function () {
      let d = new Date();
      let h = d.getHours();
      let m = d.getMinutes();
      let s = d.getSeconds();
      let time = h + ':' + m + ':' + s;
      let msg = $('#msg').val();

      let o = {
        sendTime: time,
        cont: msg
      }
      room.send(o);

      chatlog('自分> ' + o.cont + '  |  ' + o.sendTime);
      $('#msg').val("");
    });
    //チャット関数
    function chatlog(msg) {
      $('#chatLog').append('<p>' + msg + '</p>');
    }
  });
  });