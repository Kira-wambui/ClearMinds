const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/adhd_support_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Mongoose models
const Story = mongoose.model('Story', {
    name: String,
    topic: String,
    story: String,
});

const JournalEntry = mongoose.model('JournalEntry', {
    date: Date,
    entry: String,
});

app.use(bodyParser.json());
app.use(cors());

// Endpoint to share a story
app.post('/api/share-story', async (req, res) => {
    const { name, topic, story } = req.body;
    const newStory = new Story({ name, topic, story });
    try {
        await newStory.save();
        console.log('Story shared:', newStory);
        res.json({ message: 'Story shared successfully!', story: newStory });
    } catch (err) {
        console.error('Error saving story:', err);
        res.status(500).json({ error: 'Failed to share story' });
    }
});

// Endpoint to retrieve all stories
app.get('/api/stories', async (req, res) => {
    try {
        const stories = await Story.find();
        res.json(stories);
    } catch (err) {
        console.error('Error retrieving stories:', err);
        res.status(500).json({ error: 'Failed to retrieve stories' });
    }
});

// Endpoint to post a journal entry
app.post('/api/post-journal', async (req, res) => {
    const { date, entry } = req.body;
    const newEntry = new JournalEntry({ date, entry });
    try {
        await newEntry.save();
        console.log('Journal entry posted:', newEntry);
        res.json({ message: 'Journal entry posted successfully!', entry: newEntry });
    } catch (err) {
        console.error('Error posting journal entry:', err);
        res.status(500).json({ error: 'Failed to post journal entry' });
    }
});

// Endpoint to retrieve all journal entries
app.get('/api/journal', async (req, res) => {
    try {
        const journalEntries = await JournalEntry.find();
        res.json(journalEntries);
    } catch (err) {
        console.error('Error retrieving journal entries:', err);
        res.status(500).json({ error: 'Failed to retrieve journal entries' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
