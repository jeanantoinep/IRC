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

        this.init();
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

    async recvLogin() {
        console.log("login received from client");
    }

    async recvListRoom() {
        console.log("listRoom from client");
        let result = await this.dbDriver.getRooms();
        if (result == 'error') {
            this.io.emit("listRoom", JSON.stringify({ "result": result })); // emit l'erreur au client
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