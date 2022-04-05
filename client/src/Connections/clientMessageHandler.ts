import DisplayDriver from "../Display/displayDriver";
import {ServerToClientEvents, ClientToServerEvents} from './socketEvents'
import {io, Socket} from 'socket.io-client'

export class ClientMessageHandler {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    constructor(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
        this.socket = socket;
    }

    init() {

        // let rlDriver = DisplayDriver.getDriver();
        // rlDriver.on('line', (input: string) => {
        //     return this.parseMessage(input);
        // });
    }

    parseMessage(message: string) {
        if(message.startsWith('/'))
            return this.parseCommand(message);
        else
            return this.sendMessage(message);
    }

    parseCommand(command: string) {
        let commandArgs = command.split(' ');

        switch(commandArgs[0]) {
            case '/rooms':
                ;
            case '/join' :
                ;
            case '/history':
                ;
            case '/leave':
                ;
            case '/create':
                ;
            case '/users':
                ;
            case '/add':
                ;
            case '/pm':
                ;
                
        }
    }

    sendMessage(message: string) {

    }

    sendLoginRequest(username: string = '', password: string = ''){

    }

}