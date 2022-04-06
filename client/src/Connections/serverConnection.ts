import {io, Socket} from 'socket.io-client'

import Config from '../config'
import DisplayDriver from '../Display/displayDriver';
import {ServerToClientEvents, ClientToServerEvents} from './socketEvents'


export default class ServerConnection {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private connectionTryCount: number = 3;

    constructor(){
        let url = `${Config.hostName}:${Config.portNumber}`
        DisplayDriver.print(`Trying to connect to ${url} \n`)

        this.socket = io(url)
    }

    getSocket() {
        return this.socket;
    }


}
