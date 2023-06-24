const io = require("socket.io")(3000, {
  cors: {
    origin: ["http://localhost:8888"],
  },
});

io.on("connection", (socket) => {
  socket.on("send-message", (message, room) => {
    socket.to(room).emit("receive-message", message);
  });
  socket.on("join-room", (room, cb) => {
    socket.join(room);
    cb(`joined ${room} room`);
  });
});
