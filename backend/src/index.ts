import express from 'express';
import socketio from 'socket.io';
import { BoardState, PartialUpdate, Board } from 'slant';

const app = express();
const server = require('http').Server(app);
const port = 5000;
const io: socketio.Server = require('socket.io')(server);

app.use(express.static('../frontend/build'));
app.use('*', (req, res) => res.status(200).sendFile("/frontend/build/index.html", { root: '..' }));

let state: BoardState | undefined = undefined;

io.on('connection', socket => {
  socket.emit('full', state);
  socket.on('full', newState => {
    state = newState;
  });
  socket
})

app.listen(port, () => console.log(`Listening on port ${port}`));
