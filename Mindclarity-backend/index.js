const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.post('/api/share-story', (req, res) => {
    const { name, topic, story } = req.body;
    // Handle form submission logic here
    console.log(`Story received: ${name}, ${topic}, ${story}`);
    res.status(200).send({ message: 'Thanks for sharing! Your story will inspire others.' });
});

app.post('/api/need-help-now', (req, res) => {
    // Handle the immediate help request
    console.log('Immediate help requested');
    res.status(200).send({ message: 'Getting immediate help... (API call would happen here)' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
