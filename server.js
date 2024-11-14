const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
// const port = process.env.PORT || 3232;

app.use(express.json());

// Endpoint for receiving CAN data from Raspberry Pi
app.post('/update_data', (req, res) => {
    const canData = req.body;
    console.log('Received CAN data:', canData);

    // Broadcast CAN data to all connected clients
    io.emit('can_data', canData);
    res.sendStatus(200);
});

// Serve a simple HTML file (for testing display)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3232, () => {
    console.log('Server running on port:' + `${port}`);
});
