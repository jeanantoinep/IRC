import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./socketEvents";
import { DatabaseDriver } from "../databasedriver";

export class ClientMessageHandler {
    private io: Server<ClientToServerEvents, ServerToClientEvents>;
    // private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private dbDriver: DatabaseDriver;

    constructor(io: Server<ClientToServerEvents, ServerToClientEvents>, dbDriver: DatabaseDriver) {
        // this.socket = socket;
        this.io = io;
        this.dbDriver = dbDriver;
    }

    init() {
        this.io.on("connection", (socket) => {
            socket.on("ascii", () => this.recvAscii());
            socket.on("login", () => this.recvLogin());
            socket.on("listRoom", () => this.recvListRoom());
            socket.on("addRoom", (roomName: string) => this.recvAddRoom(roomName));
        })
    }

    recvAscii() {
        var ascii_art: string = `________/\\\_______        __/\\\________/\\\_        _____/\\\\\\\\\____        __/\\\\\\\\\\\\____
 _____/\\\\/\\\\____        _\/\\\_______\/\\\_        ___/\\\\\\\\\\\\\__        _\/\\\////////\\\__
  ___/\\\//\////\\\__        _\/\\\_______\/\\\_        __/\\\/////////\\\_        _\/\\\______\//\\\_
   __/\\\______\//\\\_        _\/\\\_______\/\\\_        _\/\\\_______\/\\\_        _\/\\\_______\/\\\_
    _\//\\\______/\\\__        _\/\\\_______\/\\\_        _\/\\\\\\\\\\\\\\\_        _\/\\\_______\/\\\_
     __\///\\\\/\\\\/___        _\/\\\_______\/\\\_        _\/\\\/////////\\\_        _\/\\\_______\/\\\_
      ____\////\\\//_____        _\//\\\______/\\\__        _\/\\\_______\/\\\_        _\/\\\_______/\\\__
       _______\///\\\\\\__        __\///\\\\\\\\\/___        _\/\\\_______\/\\\_        _\/\\\\\\\\\\\\/___
        _________\//////___        ____\/////////_____        _\///________\///__        _\////////////_____`
        this.io.emit("ascii", ascii_art);
    }

    recvLogin() {
        console.log("login received from client");
    }

    recvListRoom() {
        console.log("list_room from client");
        let result = this.dbDriver.getRooms();
        console.log(result);
        // if (result[0] == '0') {
        //     io.emit("listRoom", JSON.stringify({"answer":"Error while trying to list rooms"}))
        //     throw err
        // }
        // let resultString = JSON.stringify(result)
        // io.emit("listRoom", resultString)
    }

    recvAddRoom(roomName: string) {
        console.log("addRoom from client");
        let result = this.dbDriver.addRoom(roomName);
        // console.log(result)
        // pool.query("INSERT INTO `room` (name) VALUES (?)", [roomName], function (err, result) {
        //     if (err) {
        //         io.emit("addRoom", JSON.stringify({"answer":"Error while trying to add a room"}))
        //         throw err;
        //     }
        //     io.emit("addRoom", JSON.stringify({"answer":"Room added"}))
        // });
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
