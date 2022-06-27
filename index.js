import express from "express";
import http from "http";
import { Server } from "socket.io";
import animals from './animals.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const users = {};

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: '.' });
});

app.get("/randomName", (req, res) => {
    res.send(getRandomName());
});

const getRandomName = () => {
    const random = Math.floor(Math.random() * animals.length);
    return(animals[random] + ("" + +new Date()).slice(10));
}

server.listen(3000, () => {
    console.log("listening on *:3000");
});

io.on("connection", (socket) => {
    console.log('connection', socket.id);
    const name = getRandomName();
    users[socket.id] = { name };
    const user = { id: socket.id, name }
    socket.emit("randomName", name);
    socket.emit("users", users);
    socket.broadcast.emit('user_connect', user)

    socket.on("message", (msg) => {
        console.log("message from", user)
        socket.broadcast.emit("message", msg, user);
    });

    socket.on("disconnect", () => {
        console.log(socket.id, 'disconnect');
        delete users[socket.id];
        socket.broadcast.emit('user_disconnect', user)
    })

    socket.on("rename", (name) => {
        users[socket.id] = name;
        user.name = name;
        socket.broadcast.emit("rename", user);
    })
});
