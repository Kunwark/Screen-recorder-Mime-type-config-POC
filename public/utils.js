export function download(chunks, fileName) {
    let videoBlob = new Blob(chunks, {
        type: chunks[0].type
    });
    console.log("chunks type is ", chunks[0].type);
    console.log("videoBlob in download function",videoBlob);

    let url = URL.createObjectURL(videoBlob);
    let a = document.createElement("a");
    a.href = url;
    document.body.appendChild(a);
    a.download = fileName;
    a.click();

    // release / remove
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}