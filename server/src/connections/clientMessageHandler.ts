import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./socketEvents";
import { DatabaseDriver } from "../databasedriver";
import { ascii_art } from '../ascii';


export class ClientMessageHandler {
    private io: Server<ClientToServerEvents, ServerToClientEvents>;
    private dbDriver: DatabaseDriver;

    constructor(io: Server<ClientToServerEvents, ServerToClientEvents>, dbDriver: DatabaseDriver) {
        this.io = io;
        this.dbDriver = dbDriver;
        this.init();
    }

    init() {
        this.io.on("connection", (socket) => {
            socket.on("ascii", () => this.recvAscii(socket));
            socket.on("anonymousLogin", (userData: string) => this.recvAnonymousLogin(userData, socket));
            socket.on("login", (userData: string) => this.recvLogin(userData, socket));
            socket.on("listRoom", () => this.recvListRoom(socket));
            socket.on("addRoom", (roomName: string) => this.recvAddRoom(roomName, socket));
            socket.on("joinRoom", (roomName: string) => this.recvJoinRoom(roomName, socket));
            socket.on("listUser", (roomName: string) => this.recvListUser(roomName, socket));
            socket.on("leaveRoom", (roomName: string) => this.recvLeaveRoom(roomName, socket));
        })
    }

    recvAscii(socket: Socket) {
        this.io.to(socket.id).emit("ascii", ascii_art);
    };

    async recvAnonymousLogin(data: string, socket: Socket) {
        console.log("anonymous login from client", socket.id);
        let result = await this.dbDriver.getUserByUsername(JSON.parse(data)['username']);
        if (result != "[]") {
            this.io.to(socket.id).emit("anonymousLogin", JSON.stringify({ "result": "login_exists" }));
        } else {
            this.io.to(socket.id).emit("anonymousLogin", JSON.stringify({ "result": "ok" }));
            socket.data['username'] = JSON.parse(result)[0]['username'];
        }
    }

    async recvLogin(data: string, socket: Socket) {
        console.log("login from client", socket.id);
        let password: string = JSON.parse(data)['password'];
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
                } else {
                    this.io.to(socket.id).emit("login", JSON.stringify({ 'result': 'wrong_pwd' }));
                }
                break;
        }
    }

    async recvListRoom(socket: Socket) {
        console.log("listRoom from client", socket.data['username']);
        let result = await this.dbDriver.getRooms();
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
        let result = await this.dbDriver.addRoom(roomName);
        if (result == 'duplicate_entry') {
            this.io.to(socket.id).emit("addRoom", JSON.stringify({ "result": "room_exists", "room_name": roomName })); // emit error to client
        } else {
            this.io.to(socket.id).emit("addRoom", JSON.stringify({ "result": "success", "room_name": roomName }));
        }
    }

    async recvJoinRoom(roomName: string, socket: Socket) {
        console.log("joinRoom from client", socket.data['username']);
        let result = await this.dbDriver.getRoomByName(roomName);
        if (result != "[]") {
            try {
                socket.join(roomName);
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
        var roomUsers = await this.io.in(roomName).fetchSockets();
        var usernames: string[] = [];
        roomUsers.forEach(element => {
            usernames.push(element.data['username']);
        });
        this.io.to(socket.id).emit("listUser", JSON.stringify({ "usernames": usernames }));
    }

    recvLeaveRoom(roomName: string, socket: Socket) {
        console.log("leaveRoom from client", socket.data['username']);
        try {
            socket.leave(roomName);
            this.io.to(socket.id).emit("leaveRoom", JSON.stringify({ "result": "ok", "room_name": roomName }));
        } catch (e) {
            console.log(e);
            this.io.to(socket.id).emit("leaveRoom", JSON.stringify({ "result": "error", "room_name": roomName }));
        }
    }

    recvAcceptFriend(friendName: string){
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