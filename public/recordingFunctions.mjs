let videoElement;
let chunks = [];
export function initializeVideoElements(config = {}) {
    const {
        videoDisplayId = 'videoDisplay'
    } = config;

    videoElement = document.getElementById(videoDisplayId);
}
export async function startCapture(displayMediaOptions) {
    let captureStream = null;

    try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch (err) {
        console.error(`Error: ${err}`);
    }
    return captureStream;
}


export async function playRecording(filename) {
    chunks = [];
    // Set the video source to play the selected recording
    videoElement.src = `/recordings/${filename}`;
}

export async function fetchRecordingsList() {
    try {
        const response = await fetch('/get-recordings');
        const data = await response.json();

        if (data.success) {
            const recordingsList = document.getElementById('recordingsList');
            recordingsList.innerHTML = ''; // Clear existing list

            await data.recordings.forEach(filename => {
                const listItem = document.createElement('li');
                listItem.textContent = filename;

                // Add an event listener to play the video when the list item is clicked
                listItem.addEventListener('click', () => playRecording(filename));

                recordingsList.appendChild(listItem);
            });
        } else {
            console.error('Error fetching recordings list:', data.error);
        }
    } catch (error) {
        console.error('Error fetching recordings list:', error);
    }
}

export function pauseRecording(){
    console.log('Screen recording paused.');
}

export function resumeRecording(){
    console.log('Screen recording resumed.');
}
