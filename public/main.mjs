import {initializeVideoElements, startCapture, fetchRecordingsList, pauseRecording} from "./recordingFunctions.mjs";
let startButton = document.getElementById('start');
let pauseButton = document.getElementById('pause');
let stopButton = document.getElementById('stop');
let chunks = [];

// Initialize elements
initializeVideoElements();

document.addEventListener('DOMContentLoaded', () => {
    fetchRecordingsList().catch(error => {
        console.error('Error fetching recordings list:', error);
    });
});

if (navigator.mediaDevices) {
    const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp8") ? "video/webm; codecs=vp8" : "video/webm";
    startButton.addEventListener('click', startRecording);


    async  function startRecording(){
        startButton.disabled = true;
        pauseButton.addEventListener('click',pauseRecording);
        pauseButton.removeAttribute("disabled");
        stopButton.addEventListener('click',stopRecording);
        stopButton.removeAttribute("disabled");

        let mediaStream = await startCapture({
            video: true
        })

        let mediaRecorder = new MediaRecorder(mediaStream,{
            mimeType: mime
        });

        mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
            stopRecording()
            console.log('screen sharing has ended.')
        });

        mediaStream.getVideoTracks()[0].addEventListener('mute', () => console.log('screen sharing has ended (mute)'));
        mediaStream.getVideoTracks()[0].addEventListener('unmute', () => console.log('screen sharing has ended (unmute)'));

        mediaRecorder.addEventListener('dataavailable', function(e) {
            chunks.push(e.data)
        })
        mediaRecorder.addEventListener('stop', function(){
            startButton.disabled = false;
            saveRecording();
        })

        function stopRecording(){
            let tracks = mediaStream.getTracks();
            tracks.forEach(track => track.stop());
            mediaStream = null;
            mediaRecorder.stop();
            document.getElementById('start').disabled = false;
            pauseButton.disabled = true;
            stopButton.disabled = true;
            console.log('Screen recording stopped.');
        }

        mediaRecorder.start();
    }

    function saveRecording(e = null) {
        if(e != null){
            e.preventDefault();
        }

        const formData = new FormData();
        let blob = new Blob(chunks, {
            type: chunks[0].type
        })

        const myFile = new File(
            [blob],
            `proof.webm`,
            {
                type: mime,
                lastModified: new Date(),
            });

        formData.append('recording', myFile, 'proof.webm');

        fetch('/save-recording', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (response.status === 200) {
                    console.log('Recording saved!');
                } else {
                    throw new Error('Error saving recording');
                }
            })
            .catch(error => {
                console.error(error);
                console.log('Error saving recording');
            });
    }
}else{
    console.log("getUserMedia is not supported.");
}
  