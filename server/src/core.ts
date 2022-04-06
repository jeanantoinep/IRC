import { Server } from 'socket.io'
import { ServerToClientEvents, ClientToServerEvents } from './connections/socketEvents'


export class Core {
    
    private io: Server<ClientToServerEvents, ServerToClientEvents>;
    
    
    constructor() {
        this.io = this.initSocket()
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