import express from "express";
import {Server} from "socket.io";

const app = express();
const io = new Server({
    cors: {
        origin: "http://localhost:3000",
    }
});


const emailToSocketMap = new Map();
const socketToEmailMap = new Map();


io.on("connection" , (socket) => {
    console.log("A user connected: ", socket.id);
    

    socket.on("join-room" , ({email, roomId}) => {
        emailToSocketMap.set(email, socket.id);
        socketToEmailMap.set(socket.id, email);
        socket.join(roomId);
        io.to(roomId).emit("user-joined", {email, roomId})
        io.to(socket.id).emit("join-room", {email, roomId});
    })

    socket.on("call-user" , ({to, offer}) => {
        const remoteUserSocket = emailToSocketMap.get(to.email);
        const localUser = socketToEmailMap.get(socket.id);
        socket.to(remoteUserSocket).emit("incoming-call", {socketId: socket.id, from: localUser, offer });
    })

    socket.on("call-accepted", ({to, answer}) => {
        const remoteUserSocket = emailToSocketMap.get(to);
        const localUser = socketToEmailMap.get(socket.id);
        socket.to(remoteUserSocket).emit("call-accepted", {socketId: socket.id, from: localUser, answer });
    })


    socket.on("negotiation-needed", ({to, offer}) => {
        const remoteUserSocket = emailToSocketMap.get(to);
        const localUser = socketToEmailMap.get(socket.id);
        socket.to(remoteUserSocket).emit("negotiation-needed", {socketId: socket.id, from: localUser, offer });
    })


    socket.on("negotiation-done", ({to, answer}) => {
        const remoteUserSocket = emailToSocketMap.get(to);
        const localUser = socketToEmailMap.get(socket.id);
        socket.to(remoteUserSocket).emit("negotiation-final", {socketId: socket.id, from: localUser, answer });
    })


    socket.on("disconnect" , () => {
        console.log("Disconnected User: ", socket.id);
    })
})

app.listen(8000, () => {
    console.log("HTTP Server is listening on PORT 8000");
})
io.listen(8001);