const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http'); 
const { Server } = require('socket.io'); 

const app = express();
const server = http.createServer(app); 
const io = new Server(server); 
const PORT = process.env.PORT || 4000; 

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 

mongoose.connect('mongodb+srv://FrUnDee:663663663Mm663@cluster0.s7abo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB Atlas");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB Atlas", err);
    });

const wishSchema = new mongoose.Schema({
    name: { type: String, required: true },
    wish: { type: String, required: true },
    color: { type: String, default: '#7E121D' } 
});

const Wish = mongoose.model('Wish', wishSchema);
module.exports = Wish;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); 
});

app.get('/display', (req, res) => {
    res.sendFile(__dirname + '/public/display.html'); 
});

app.get('/thank', (req, res) => {
    res.sendFile(__dirname + '/public/thank.html'); 
});

app.post('/thank', async (req, res) => {
    const { name, wish, color } = req.body;

    if (!name || !wish) {
        return res.status(400).send('Error: Please fill in all fields.');
    }

    const newWish = new Wish({ name: name, wish: wish, color:color || '#7E121D' });

    try {

        const savedWish = await newWish.save();

        io.emit('newWish', savedWish);

        setTimeout(async () => {
            try {
                await Wish.findByIdAndDelete(savedWish._id);
                console.log(`Wish deleted: ${savedWish.wish}`);
                io.emit('deleteWish', savedWish._id); 
            } catch (err) {
                console.error(`Error deleting wish: ${err}`);
            }
        }, 5 * 60 * 1000); 

        res.sendFile(__dirname + '/public/thank.html');
    } catch (err) {
        console.error(err);
        res.sendFile(__dirname + '/public/error.html');
    }
});

app.get('/wishes', async (req, res) => {
    try {
        const wishes = await Wish.find();
        res.json(wishes);
    } catch (err) {
        console.error('Error fetching wishes:', err);
        res.status(500).send('Error fetching wishes');
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
