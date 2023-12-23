import {download} from "./utils.js";
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

        mediaRecorder.addEventListener('dataavailable', function(e) {
            chunks.push(e.data)
        })

        mediaRecorder.addEventListener('stop', function(){
            startButton.disabled = false;

            let blob = new Blob(chunks, {
                type: chunks[0].type
            })
            let video = document.querySelector("video")
            video.src = URL.createObjectURL(blob)


            download(chunks, "kunwar-file.webm")
            saveRecording();
        })


        mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
            stopRecording()
            console.log('screen sharing has ended.')
        });
        mediaStream.getVideoTracks()[0].addEventListener('mute', () => console.log('screen sharing has ended'));
        mediaStream.getVideoTracks()[0].addEventListener('unmute', () => console.log('screen sharing has ended'));


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
        console.log('Screen recording initiated.');
    }  //  function startRecording(){

    function saveRecording(e = null) {
        if(e != null){
            e.preventDefault();
        }
        console.log('Saving recording.');

        // Create a FormData object to send the recording file to the server
        const formData = new FormData();
        let blob = new Blob(chunks, {
            type: chunks[0].type
        })

        console.log(chunks[0].type)
        console.log(mime)


        const myFile = new File(
            [blob],
            `proof.webm`,
            {
                type: mime,
                lastModified: new Date(),
            });

        formData.append('recording', myFile);


        // Use fetch to send a POST request to the server
        fetch('/save-recording', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error saving recording');
                }
                console.log('Recording saved!');
            })
            .catch(error => {
                console.error(error);
                console.log('Error saving recording');
            });
    }
    console.log("getUserMedia supported.");
}else{
    console.log("getUserMedia is not supported.");
}
  