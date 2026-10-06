const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Student = require('./models/Student');

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collegeDB';

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/students', async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.json(students);
});

app.post('/students', async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
});

app.put('/students/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid student ID.' });
  }

  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!student) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  res.json(student);
});

app.delete('/students/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid student ID.' });
  }

  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  res.json({ message: 'Student deleted.' });
});

app.use((error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

async function startServer() {
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

startServer().catch((error) => {
  console.error('Unable to connect to MongoDB:', error.message);
  process.exit(1);
});