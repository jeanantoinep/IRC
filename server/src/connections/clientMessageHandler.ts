import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./socketEvents";
import { DatabaseDriver } from "../databasedriver";
import { ascii_art } from '../ascii';
import { on } from "events";


export class ClientMessageHandler {
    private io: Server<ClientToServerEvents, ServerToClientEvents>;
    private dbDriver: DatabaseDriver;
    private allSockets: { [username: string]: string };

    constructor(io: Server<ClientToServerEvents, ServerToClientEvents>, dbDriver: DatabaseDriver) {
        this.io = io;
        this.dbDriver = dbDriver;
        this.allSockets = {};
        this.init();
    }

    private getTimestamp(): string {
        let now = new Date();
        now.setTime(Date.now());
        return `${String(now.getHours()).padStart(2, '0')}:` +
            `${String(now.getMinutes()).padStart(2, '0')}:` +
            `${String(now.getSeconds()).padStart(2, '0')}`;

    }

    init() {
        this.io.on("connection", (socket) => {
            socket.on("ascii", () => this.recvAscii(socket));
            socket.on("anonymousLogin", (userData: string) => this.recvAnonymousLogin(userData, socket));
            socket.on("login", (userData: string) => this.recvLogin(userData, socket));
            socket.on("register", (userData: string) => this.recvRegister(userData, socket));
            socket.on("listRoom", () => this.recvListRoom(socket));
            socket.on("addRoom", (roomName: string) => this.recvAddRoom(roomName, socket));
            socket.on("joinRoom", (roomName: string) => this.recvJoinRoom(roomName, socket));
            socket.on("history", (data: string) => this.recvHistory(data, socket));
            socket.on("msg", (data: string) => this.recvMsg(data, socket));
            socket.on("listUser", (roomName: string) => this.recvListUser(roomName, socket));
            socket.on("leaveRoom", (roomName: string) => this.recvLeaveRoom(roomName, socket));
            socket.on("pm", (data: string) => this.recvPm(data, socket));
        })
    }

    async recvHistory(data: string, socket: Socket) {
        console.log("history from client", socket.data['username']);
        var parsedData = JSON.parse(data);
        var messages = await this.dbDriver.getRoomMessages(parsedData['room_name']); // get room messages from bdd
        console.log(messages);
    }

    recvAscii(socket: Socket) {
        this.io.to(socket.id).emit("ascii", ascii_art);
    };

    async recvAnonymousLogin(data: string, socket: Socket) {
        console.log("anonymous login from client", socket.id);
        console.log(data)
        var parsedData = JSON.parse(data);
        var result = await this.dbDriver.getUserByUsername(parsedData['username']);
        if (result != "[]") {
            this.io.to(socket.id).emit("anonymousLogin", JSON.stringify({ "result": "login_exists" }));
        } else {
            this.io.to(socket.id).emit("anonymousLogin", JSON.stringify({ "result": "ok" }));
            socket.data['username'] = parsedData['username'];
            console.log(socket.data['username']);
            this.allSockets[socket.data['username'].toLowerCase()] = socket.id;
            console.log(this.allSockets[socket.data['username'].toLowerCase()]);
        }
    }

    async recvLogin(data: string, socket: Socket) {
        console.log("login from client", socket.id);
        var password: string = JSON.parse(data)['password'];
        switch (password) {
            case '': // no password transmitted
                let result = await this.dbDriver.getUserByUsername(JSON.parse(data)['username']);
                if (result == "[]") { // if user is unknown
                    this.io.to(socket.id).emit("login", JSON.stringify({ "result": "need_auth" }));
                } else { // user is already registered
                    this.io.to(socket.id).emit("login", JSON.stringify({ "result": "need_pwd" }));
                }
                break;

            default:
                let result2 = await this.dbDriver.getUserByUsername(JSON.parse(data)['username']);
                if (password == JSON.parse(result2)[0]['password']) { // if password is OK
                    this.io.to(socket.id).emit("login", JSON.stringify({ "result": "ok" }));
                    socket.data['username'] = JSON.parse(result2)[0]['username'];
                    this.allSockets[socket.data['username'].toLowerCase()] = socket.id;
                } else {
                    this.io.to(socket.id).emit("login", JSON.stringify({ 'result': 'wrong_pwd' }));
                }
                break;
        }
    }

    async recvRegister(userData: string, socket: Socket) {
        console.log("register from client", socket.id);
        var dataParsed = JSON.parse(userData);
        var result = await this.dbDriver.getUserByUsername(dataParsed['username']);
        if (result == "error") { // sql error
            this.io.to(socket.id).emit("register", JSON.stringify({ "result": result }))
        } else if (result != "[]") { // username already taken
            this.io.to(socket.id).emit("register", JSON.stringify({
                "result": "username_exists", "username": dataParsed['username']
            }))
        } else {
            var result2 = await this.dbDriver.addUser(userData);
            if (result2 == "error") { // sql error
                this.io.to(socket.id).emit("register", JSON.stringify({ "result": result }))
            } else { // new user added
                this.io.to(socket.id).emit("register", JSON.stringify({
                    "result": "ok", "username": dataParsed['username']
                }));
                socket.data['username'] = dataParsed['username'];
                this.allSockets[socket.data['username'].toLowerCase()] = socket.id;
            }
        }
    }

    async recvListRoom(socket: Socket) {
        console.log("listRoom from client", socket.data['username']);
        var result = await this.dbDriver.getRooms();
        if (result == 'error') {
            this.io.to(socket.id).emit("listRoom", JSON.stringify({ "result": result })); // emit error to client
        } else if (result == '[]') {
            this.io.to(socket.id).emit("listRoom", JSON.stringify({ "result": "no_rooms" }));
        } else {
            this.io.to(socket.id).emit("listRoom", result);
        }
    }

    async recvAddRoom(roomName: string, socket: Socket) {
        console.log("addRoom from client", socket.data['username']);
        var result = await this.dbDriver.addRoom(roomName.toLowerCase());
        if (result == 'duplicate_entry') {
            this.io.to(socket.id).emit("addRoom", JSON.stringify({ "result": "room_exists", "room_name": roomName })); // emit error to client
        } else {
            this.io.to(socket.id).emit("addRoom", JSON.stringify({ "result": "success", "room_name": roomName }));
        }
    }

    async recvJoinRoom(roomName: string, socket: Socket) {
        console.log("joinRoom " + roomName + " from client", socket.data['username']);
        var result = await this.dbDriver.getRoomByName(roomName);
        if (result != "[]") {
            try {
                socket.join(roomName.toLowerCase());
                this.io.to(socket.id).emit("joinRoom", JSON.stringify({ "result": "ok", "room_name": roomName }));
            } catch (e) {
                console.log(e);
                this.io.to(socket.id).emit("joinRoom", JSON.stringify({ "result": "error", "room_name": roomName }));
            }
        } else {
            this.io.to(socket.id).emit("joinRoom", JSON.stringify({ "result": "room_unknown", "room_name": roomName }));
        }
    }

    async recvListUser(roomName: string, socket: Socket) {
        console.log("listUser from client", socket.data['username']);
        var roomUsers = await this.io.in(roomName.toLowerCase()).fetchSockets();
        var usernames: string[] = [];
        roomUsers.forEach(element => {
            usernames.push(element.data['username']);
        });
        this.io.to(socket.id).emit("listUser", JSON.stringify({ "usernames": usernames }));
    }

    async recvMsg(data: string, socket: Socket) {
        console.log("msg from client", socket.data['username']);
        var dataParsed = JSON.parse(data);
        dataParsed['timestamp'] = this.getTimestamp();
        var result = await this.dbDriver.addMsg(JSON.stringify(dataParsed), socket.data['username']);
        console.log("result addMsg=", result);
        if (result == "error") {
            this.io.to(socket.id).emit("msg", JSON.stringify({ "result": result }));
        } else {
            var userId = this.allSockets[socket.data['username'].toLowerCase()];
            console.log(userId);
            var userType = (userId == undefined) ? "guest" : "registered";
            this.io.to(dataParsed['room_name'].toLowerCase()).emit("msg", JSON.stringify(
                {
                    "username": socket.data['username'],
                    "user_type": userType,
                    "type": "message",
                    "message": dataParsed["message"],
                    "timestamp": this.getTimestamp()
                }
            ));
        }
    }

    async recvPm(data: string, socket: Socket) {
        console.log("pm from client", socket.data['username']);
        var dataParsed = JSON.parse(data);
        console.log(data);
        this.io.to(socket.id).emit("pm", JSON.stringify(
            { "result": "user_unregistered", "sender_name": socket.data['username'] }));
        console.log(this.allSockets);
        var receiverId = this.allSockets[dataParsed['receiver_name'].toLowerCase()];
        if (receiverId == undefined) {
            this.io.to(socket.id).emit("pm", JSON.stringify(
                {
                    "result": "user_unknown",
                    "username": dataParsed['receiver_name'].toLowerCase()
                }))
            console.log("SOCKET NOT FOUND");
        } else {
            this.io.to(receiverId).emit("msg", JSON.stringify(
                {
                    "username": socket.data['username'],
                    "type": "pm",
                    "message": dataParsed["message"],
                    "timestamp": this.getTimestamp()
                }))
        }
    }

    recvLeaveRoom(roomName: string, socket: Socket) {
        console.log("leaveRoom " + roomName + " from client", socket.data['username']);
        try {
            socket.leave(roomName.toLowerCase());
            this.io.to(socket.id).emit("leaveRoom", JSON.stringify({ "result": "ok", "room_name": roomName }));
        } catch (e) {
            console.log(e);
            this.io.to(socket.id).emit("leaveRoom", JSON.stringify({ "result": "error", "room_name": roomName }));
        }
    }

    recvAcceptFriend(friendName: string) {
        console.log("acceptFriend from client");
        let result = this.dbDriver.acceptFriend(friendName);
        // console.log(result)
        // pool.query("INSERT INTO `friend` (name) VALUES (?)", [friendName], function (err, result) {
        //     if (err) {
        //         io.emit("acceptFriend", JSON.stringify({"answer":"Error while trying to accept a friend"}))
        //         throw err;
        //     }
        //     io.emit("acceptFriend", JSON.stringify({"answer":"Friend accepted"}))
        // });
    }
}
