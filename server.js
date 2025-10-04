const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors

const app = express();
const port = process.env.PORT || 3000; // Use Render's port

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS

// MongoDB Connection
// Use an environment variable for the connection string for security
const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error('MONGODB_URI environment variable is not set. Please set it in Render.');
  process.exit(1);
}

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas!');
    // Start the server only after successful database connection
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define a Mongoose schema and model for user health data
const userHealthDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  steps: Number,
  weight: Number,
  height: Number,
  bmi: Number,
  waterIntake: Number
});

const UserHealthData = mongoose.model('UserHealthData', userHealthDataSchema);

// API endpoint to save health data
app.post('/api/saveHealthData', async (req, res) => {
  try {
    const { userId, steps, weight, height, waterIntake } = req.body;

    // Calculate BMI
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);

    const newHealthData = new UserHealthData({
      userId,
      steps,
      weight,
      height,
      bmi,
      waterIntake
    });

    await newHealthData.save();
    res.status(201).json({ message: 'Health data saved successfully!', data: newHealthData });
  } catch (error) {
    console.error('Failed to save health data:', error);
    res.status(500).json({ message: 'Error saving data', error: error.message });
  }
});
