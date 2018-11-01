$(function(){
  const ss = ScreenShare.create({debug: true});

  $('#start-screen').on('click', () => {
      
    if (ss.isScreenShareAvailable() === false) {
      alert('Screen Share cannot be used. Please install the Chrome extension.');
      return;
    }

    ss.start({
      width:     $('#Width').val(),
      height:    $('#Height').val(),
      frameRate: $('#FrameRate').val(),
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