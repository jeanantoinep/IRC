import { Server } from "socket.io";
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
            socket.on("ascii", () => this.recvAscii());
            socket.on("login", (data: string) => this.recvLogin(data));
            socket.on("listRoom", () => this.recvListRoom());
            socket.on("addRoom", (roomName: string) => this.recvAddRoom(roomName));
        })
    }

    recvAscii() {
        this.io.emit("ascii", ascii_art);
    };

    async recvLogin(data: string) {
        console.log("login received from client");
        let password: string = JSON.parse(data)['password'];
        switch (password) {
            case '':
                let result = await this.dbDriver.getUserByUsername(JSON.parse(data)['username']);
                if (result == "[]") { // si utilisateur est inconnu
                    this.io.emit("login", JSON.stringify({ "result": "need_auth" }));
                } else {
                    this.io.emit("login", JSON.stringify({ "result": "need_pwd" }));
                }
                break;

            default:
                let result2 = await this.dbDriver.getUserByUsername(JSON.parse(data)['username']);
                if (password == JSON.parse(result2)[0]['password']) { // si password OK
                    this.io.emit("login", JSON.stringify({ "result": "ok" }));
                } else {
                    this.io.emit("login", JSON.stringify({ 'result': 'wrong_pwd' }));
                }
                break;
        }
    }

    async recvListRoom() {
        console.log("listRoom from client");
        let result = await this.dbDriver.getRooms();
        if (result == 'error') {
            this.io.emit("listRoom", JSON.stringify({ "result": result })); // emit l'erreur au client
        } else if (result == '[]') {
            this.io.emit("listRoom", JSON.stringify({ "result": "no_rooms" }));
        } else {
            this.io.emit("listRoom", result);
        }
    }

    async recvAddRoom(roomName: string) {
        console.log("addRoom from client");
        let result = await this.dbDriver.addRoom(roomName);
        if (result == 'duplicate_entry') {
            this.io.emit("addRoom", JSON.stringify({ "result": result })); // emit l'erreur au client
        } else {
            this.io.emit("addRoom", JSON.stringify({ "result": "success", "roomName": roomName })); // emit succès
        }
    }
}
