import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const uri = process.env.MONGO_URI;

const PORT = process.env.PORT || 3000;

if (!uri) {
  console.error('Missing MONGO_URI in .env');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const yourNameAndEmoji = { name: 'griffin', emoji: '🦅' };

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'exam.html'));
});

app.post('/api/get-name', async (req, res) => {
  try {
    const { userName } = req.body;

    if (!userName) {
      return res.status(400).json({ error: 'missing name' });
    }

    const db = client.db('cis486');
    const collection = db.collection('exam');

    const result = await collection.findOne({
      name: userName.toLowerCase().trim()
    });

    if (!result) {
      return res.status(404).json({ error: 'Name not found' });
    }

    res.json({
      message: 'Name found',
      name: result.name,
      emoji: result.emoji
    });

  } catch (error) {
    console.error('Error retrieving name:', error);
    res.status(500).json({ error: 'Failed to retrieve name' });
  }
});

app.get('/api/init-emoji', async (req, res) => {
  try {
    await client.connect();

    const db = client.db('cis486');
    const collection = db.collection('exam');

    const existingEntry = await collection.findOne({ name: yourNameAndEmoji.name });

    if (existingEntry) {
      return res.json({
        message: 'Name already exists',
        data: existingEntry
      });
    }

    const result = await collection.insertOne(yourNameAndEmoji);

    res.json({
      message: 'name & emoji recorded',
      id: result.insertedId
    });

  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ error: 'Failed to retrieve emoji' });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});