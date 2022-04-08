import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./socketEvents";
import { DatabaseDriver } from "../databasedriver";
import { ascii_art } from '../ascii';


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
            socket.on("leaveRoom", (data: string) => this.recvLeaveRoom(data, socket));
            socket.on("pm", (data: string) => this.recvPm(data, socket));
            socket.on("exit", (roomName: string) => this.recvExit(roomName, socket));
            socket.on("disconnecting", () => this.recvDisconnecting(socket));
        })
    }

    recvExit(roomName: string, socket: Socket) {
        delete this.allSockets[socket.data['username'].toLowerCase()];
        if (roomName != "") {
            this.io.to(roomName.toLowerCase()).emit("msg", JSON.stringify(
                {
                    "timestamp":this.getTimestamp(),
                    "type":"leave",
                    "reason":"exited",
                    "username":socket.data['username']
                }));
        }
    }

    recvDisconnecting(socket: Socket) {
        delete this.allSockets[socket.data['username'].toLowerCase()];
        if (socket.rooms.size > 1) {
            var socketRooms = socket.rooms.values();
            socketRooms.next();
            this.io.to(socketRooms.next()['value'].toLowerCase()).emit("msg", JSON.stringify(
                {
                    "timestamp":this.getTimestamp(),
                    "type":"leave",
                    "reason":"connection timed out",
                    "username":socket.data['username']
                }));
        }
    }

    async recvHistory(data: string, socket: Socket) {
        console.log("history from client", socket.data['username']);
        var parsedData = JSON.parse(data);
        var result = await this.dbDriver.getRoomMessages(parsedData['room_name']); // get room messages from bdd
        if (result == "error") {
            this.io.to(socket.id).emit("history", JSON.stringify({ "result": result })); // emit error to client
        } else if (result == "[]") {
            this.io.to(socket.id).emit("history", JSON.stringify({ "result": "no_messages" }));
        } else {
            this.io.to(socket.id).emit("history", result);
        }
    }

    recvAscii(socket: Socket) {
        this.io.to(socket.id).emit("ascii", ascii_art);
    };

    async recvAnonymousLogin(data: string, socket: Socket) {
        console.log("anonymous login from client", socket.id);
        var parsedData = JSON.parse(data);
        var result = await this.dbDriver.getUserByUsername(parsedData['username']);
        if (result != "[]") {
            this.io.to(socket.id).emit("anonymousLogin", JSON.stringify({ "result": "login_exists" }));
        } else {
            this.io.to(socket.id).emit("anonymousLogin", JSON.stringify({ "result": "ok" }));
            socket.data['username'] = parsedData['username'];
            this.allSockets[socket.data['username'].toLowerCase()] = socket.id;
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
        if (result == "error") {
            this.io.to(socket.id).emit("msg", JSON.stringify({ "result": result }));
        } else {
            var userId = this.allSockets[socket.data['username'].toLowerCase()];
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
        this.io.to(socket.id).emit("pm", JSON.stringify(
            { "result": "user_unregistered", "sender_name": socket.data['username'] }));
        var receiverId = this.allSockets[dataParsed['receiver_name'].toLowerCase()];
        if (receiverId == undefined) {
            this.io.to(socket.id).emit("pm", JSON.stringify(
                {
                    "result": "user_unknown",
                    "username": dataParsed['receiver_name'].toLowerCase()
                }))
            console.log("SOCKET NOT FOUND");
        } else {
            this.io.to(receiverId).to(socket.id).emit("msg", JSON.stringify(
                {
                    "username": socket.data['username'],
                    "receiver_name": dataParsed['receiver_name'],
                    "type": "pm",
                    "message": dataParsed["message"],
                    "timestamp": this.getTimestamp()
                }))
        }
    }

    recvLeaveRoom(data: string, socket: Socket) {
        console.log("leaveRoom " + JSON.parse(data)['room_name'] + " from client", socket.data['username']);
        var parsedData = JSON.parse(data);
        try {
            socket.leave(parsedData['room_name'].toLowerCase());
            this.io.to(socket.id).emit("leaveRoom", JSON.stringify({ "result": "ok", "room_name": parsedData['room_name'] }));
            var socketRooms = socket.rooms.values();
            socket.rooms.delete(parsedData['room_name']);
            socketRooms.next();
            console.log(socketRooms.next()['value']); // PROBLEME
            // this.io.to(socketRooms.next()['value']).emit("msg", JSON.stringify(
            //     {
            //         "timestamp":this.getTimestamp(),
            //         "type":"leave",
            //         "reason":"",
            //         "username":socket.data['username']
            //     }));
        } catch (e) {
            console.log(e);
            this.io.to(socket.id).emit("leaveRoom", JSON.stringify({ "result": "error", "room_name": parsedData['room_name'] }));
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
