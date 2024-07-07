const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Endpoint to handle "Share Your Story"
app.post('/api/share-story', (req, res) => {
    const { name, topic, story } = req.body;
    // Handle the data, e.g., save to a database
    console.log('Story received:', name, topic, story);
    res.json({ message: 'Story received successfully!' });
});

// Endpoint to handle "I Need Help Now"
app.post('/api/need-help-now', (req, res) => {
    // Handle the request, e.g., send an alert to support staff
    console.log('Immediate help requested');
    res.json({ message: 'Help is on the way!' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
