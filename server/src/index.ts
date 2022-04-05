import { Core } from './core'


const core = new Core();
const io = core.initSocket();
const pool = core.initMySQLConnection();

io.on("connection", (socket) => {
    console.log("connexion :", socket.handshake.headers.host);
    console.log(socket.id)

    // works when broadcast to all
    // io.emit("noArg");

    // works when broadcasting to a room
    // io.to("r oom1").emit("basicEmit", 1, "2", Buffer.from([3]));
});


io.on("connection", (socket) => {
    socket.on("login", () => {
        console.log("login received from client");
    });

    socket.on("listRoom", () => {
        console.log("list_room from client")
        pool.query("SELECT * FROM `room`", function (err, result) {
            if (err) {
                io.emit("listRoom", JSON.stringify({"answer":"Error while trying to list rooms"}))
                throw err;
            }
            let resultString = JSON.stringify(result)
            io.emit("listRoom", resultString)
        });
    })

    socket.on("addRoom", (roomName: string) => {
        console.log("addRoom from client")
        pool.query("INSERT INTO `room` (name) VALUES (?)", [roomName], function (err, result) {
            if (err) {
                io.emit("addRoom", JSON.stringify({"answer":"Error while trying to add a room"}))
                throw err;
            }
            io.emit("addRoom", JSON.stringify({"answer":"Room added"}))
        });
    })
});