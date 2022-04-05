import {io, Socket} from 'socket.io-client'

import Config from '../config'

export default class ServerConnection {
    private socket: Socket | null = null;

    ServerConnection() {
        this.socket = null;
    }

    connect() {
        let url = `http://${Config.hostName}:${Config.portNumber}`
        this.socket = io(url);

        if(!this.socket.connected) {
            console.log(`Unable to connect to ${url}`);
            return false;
        }
    }
}