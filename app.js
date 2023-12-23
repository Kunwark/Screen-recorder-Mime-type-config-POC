const express = require('express');
const path = require('path');
const fs = require("fs");
const recordingsFolder = path.join(__dirname, 'recordings/');
const multer  = require('multer')
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

// Set EJS as the view engine
app.set('view engine', 'ejs');
// Set the views directory
app.set('views', path.join(__dirname, 'views'));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/recordings', express.static(path.join(__dirname, 'recordings')));
app.use(bodyParser.urlencoded({ extended: true }));






// Define a route for the home page
app.get('/', (req, res) => {
    // Render the 'home.ejs' view
    res.render('index', { title: 'Screen recorder practice', recordingsFolder });
});


app.post('/test', (req, res) => {
    console.log(req.body)
    res.send("testing.");
})



// Set up Multer to handle file uploads
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'recordings'),
    filename: (req, file, cb) => {
        const fileName = `recording_${Date.now()}.webm`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });


// Add this route for saving the recording
app.post('/save-recording', upload.single('recording'), (req, res) => {
    try {
        console.log('Recording saved!');
        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
});


// Add this route for saving the recording
app.post('/save-recordings', (req, res) => {
    try {

        const fileName = `recording_${Date.now()}.webm`;
        const filePath = path.join(__dirname, 'recordings', fileName);
        const fileStream = fs.createWriteStream(filePath);

        console.log(req.body)
        // Pipe the request stream directly to the writeStream
        req.pipe(fileStream);

        fileStream.on('finish', () => {
            console.log('Recording saved!');

            // Send the success response with the correct MIME type
            res.status(200).end();
        });

        fileStream.on('error', (err) => {
            console.error(err);
            console.log('Error saving recording');

            // Send an error response
            res.status(500).end();
        });
    } catch (error) {
        console.error(error);

        // Send an error response
        res.status(500).end();
    }
});

app.get('/get-recordings', (req, res) => {
    // Read the contents of the recordings folder
    fs.readdir(recordingsFolder, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Error reading recordings folder' });
        }

        // Filter out non-webm files (adjust as needed)
        const webmFiles = files.filter(file => file.endsWith('.webm'));

        webmFiles.map(async (filePath, index)=>{
            const qualifiedFilePath = recordingsFolder+filePath;
            const fileStream = fs.createReadStream(qualifiedFilePath);
            try {
                const fileType = await import('file-type');
                const fileMime = await fileType.fileTypeFromStream(fileStream)
                // const pngFileMime = await fileType.fileTypeFromFile("test.png")
                // const webmFileMime = await fileType.fileTypeFromFile("kunwar-file.webm")

                console.log("fileMime", fileMime)
                // console.log("pngfileMime", pngFileMime)
                // console.log("webmFileMime", webmFileMime)

                // fileType.fromStream(fileStream)
                //     .then(fileType => {
                //         res.set('Content-Type', fileType.mime);
                //         console.log(fileType.mime)
                //         fileStream.pipe(res);
                //     })
                //     .catch(error => {
                //         console.error('Error determining MIME type:', error);
                //         res.status(500).send('Error serving video');
                //     });
            } catch (error) {
                console.error('Error importing file-type:', error);
            }


        })






        res.status(200).json({ success: true, recordings: webmFiles });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
