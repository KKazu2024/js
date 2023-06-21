const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const stickyNotes = new Map();

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('draw', (data) => {
        socket.broadcast.emit('draw', data);
    });

    for (const [id, stickyNote] of stickyNotes.entries()) {
        socket.emit('createStickyNote', stickyNote);
    }

    socket.on('createStickyNote', (data) => {
        stickyNotes.set(data.id, data);
        socket.broadcast.emit('createStickyNote', data);
    });

    socket.on('moveStickyNote', (data) => {
        const stickyNote = stickyNotes.get(data.id);
        if (stickyNote) {
          stickyNote.x = data.x;
          stickyNote.y = data.y;
          socket.broadcast.emit('moveStickyNote', data);
        }
    });

    socket.on('deleteStickyNote', (id) => {
        stickyNotes.delete(id);
        socket.broadcast.emit('deleteStickyNote', id);
    });

    socket.on('editStickyNote', (data) => {
        const stickyNote = stickyNotes.get(data.id);
        if (stickyNote) {
            stickyNote.text = data.text;
            socket.broadcast.emit('editStickyNote', data);
        }
    });

    socket.on('clearBoard', () => {
        socket.broadcast.emit('clearBoard');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));