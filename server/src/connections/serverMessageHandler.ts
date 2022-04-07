import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./socketEvents";


export class ServerMessageHandler {
    
    private io: Server<ClientToServerEvents, ServerToClientEvents>;

    constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
        this.io = io;
    }
}