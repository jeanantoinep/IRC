import {io, Socket} from 'socket.io-client'

import Config from '../config'
import DisplayDriver from '../Display/displayDriver';
import {ServerToClientEvents, ClientToServerEvents} from './socketEvents'


export default class ServerConnection {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>|null = null;
    private connectionTryCount: number = 3;

    constructor(){}

    async tryConnect() {
        let url = `http://${Config.hostName}:${Config.portNumber}`
        DisplayDriver.print(`Trying to connect to ${url}`)
        this.connect(url);
    }

    async connect(url: string) {
        this.socket = io(url);
    }

    getSocket() {
        return this.socket;
    }


}
