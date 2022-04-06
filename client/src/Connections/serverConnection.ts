import {io, Socket} from 'socket.io-client'

import Config from '../config'
import DisplayDriver from '../Display/displayDriver';
import {ServerToClientEvents, ClientToServerEvents} from './socketEvents'


export default class ServerConnection {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>|null = null;
    private connectionTryCount: number = 3;

    ServerConnection() {
    }

    async tryConnect() : Promise<boolean> {
        let url = `http://${Config.hostName}:${Config.portNumber}`

        let connectionStatus = await this.connect(url);

        if (connectionStatus)
            return true;
        
        let tryCount = this.connectionTryCount;
        
        while (!connectionStatus && tryCount != 0) {
            for(let i = 5 ; i > 0 ; i--) {
                DisplayDriver.printOnLine(`Retrying in ${i} seconds ...`, 1);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            DisplayDriver.print('\n');

            connectionStatus = await this.connect(url);
            tryCount--;
        }

        return connectionStatus;
    }

    async connect(url: string) : Promise<boolean> {
        this.socket = io(url);
        if(!this.socket.connected) {
            DisplayDriver.print(`Unable to connect to ${url}\n`);
            return false;
        }
        return true;
    }

    getSocket() {
        return this.socket;
    }


}