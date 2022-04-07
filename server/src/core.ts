import { Server } from 'socket.io'
import { DatabaseDriver } from './databasedriver';
import { ClientMessageHandler } from './connections/clientMessageHandler';
import { ServerToClientEvents, ClientToServerEvents } from './connections/socketEvents'


export class Core {
    
    private io: Server<ClientToServerEvents, ServerToClientEvents>;
    private clientMessageHandler: ClientMessageHandler;
    
    constructor() {
        this.io = this.initSocket();
        this.clientMessageHandler = new ClientMessageHandler(this.io, new DatabaseDriver());
    }
    
    public getIo() : Server<ClientToServerEvents, ServerToClientEvents> {
        return this.io
    }
    
    /**
     * initSocket
     */
    private initSocket() {
        const io = new Server<ClientToServerEvents, ServerToClientEvents>(3000);
        return io
    }
}