const express = require('express');
const cors = require('cors');

const mongoose = require('mongoose');
const Task = require('./taskModel');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/taskScheduler');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// API routes for task CRUD operations
app.post('/api/tasks', async (req, res) => {
    // Handle the creation of a new task
    try {
        const taskData = req.body; // The task data from the request body
        const newTask = new Task(taskData);
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Error creating a task' });
    }
});

app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find(); // Use the Mongoose model to retrieve all tasks
        res.status(200).json(tasks);    
    } catch (error) {
        res.status(500).json({error: 'Error getting tasks'});
    }
});

app.delete('/api/tasks/:taskId', async (req, res) => {
    const taskId = req.params.taskId;
    try {
        const deletedTask = await Task.findByIdAndDelete(taskId); // Use the appropriate Mongoose method
        if (deletedTask) {
            res.status(200).json(deletedTask);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});