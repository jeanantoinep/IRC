import DisplayDriver from "../Display/displayDriver";
import {ServerToClientEvents, ClientToServerEvents} from './socketEvents';
import {io, Socket} from 'socket.io-client';

import { Phase } from "../Core/core";

export class ClientMessageHandler {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    private phaseCommandHandler: (command:string) => void;

    //Client data
    private username: string = '';
    private roomName: string = '';

    constructor(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
        this.socket = socket;
        this.phaseCommandHandler = this.parseCommand;

        DisplayDriver.getDriver().on('line', (input:string) => {
            this.parseMessage(input);
            // process.stdout.moveCursor(0, -1);
            // process.stdout.clearLine(0);
            // process.stdout.moveCursor(0, 1);

            // process.stdin.

            // //DisplayDriver.print('Input is:' + input + '\n')
            // input = "";
        });
    };

    public setUsername(name: string) {
        this.username = name;
    }

    public getUsername() {
        return this.username;
    }

    public setRoomName(name: string) {
        this.roomName = name;
    }

    public getRoomName() {
        return this.roomName;
    }

    public setPhase(phase: Phase) {
        switch(phase){
            case Phase.roomList:
                this.phaseCommandHandler = this.roomListCommandHandler;
                break;

            case Phase.chat:
                this.phaseCommandHandler = this.chatRoomCommandHandler;

            default:
                break;
        }
    }

    parseMessage(message: string) {
        if(message.startsWith('/'))
            return this.phaseCommandHandler(message);
        else {
            this.sendMessage(message);
            DisplayDriver.enableInput();
        }
    };

    checkArgc(args: string[], count: number) {
        return (args.length == count);
    };

    roomListCommandHandler(command: string) {
        let commandArgs = command.split(' ', 2);

        switch(commandArgs[0].toLowerCase()) {
            case '/rooms':
                this.sendRoomsListRequest();
                break;

            case '/join' :
                if(this.checkArgc(commandArgs, 2))
                    this.sendJoinRequest(commandArgs[1])
                break;

            case '/create':
                if(this.checkArgc(commandArgs, 2))
                    this.sendCreateRoomRequest(commandArgs[1]);
                this.sendCreateRoomRequest();
                break;

            case '/addroom':
                this.sendAddRoomRequest(commandArgs[1]);
            break;

            default:
                DisplayDriver.print(`You can't use ${commandArgs[0]} in the room selection\n`);
                break;
        }

    }

    chatRoomCommandHandler(command: string) {
        let commandArgs = command.split(' ', 2);

        switch(commandArgs[0]) {
            case '/join' :
                if(this.checkArgc(commandArgs, 2))
                    this.sendJoinRequest(commandArgs[1])
                break;

            case '/history':
                if(this.checkArgc(commandArgs, 2))
                    this.sendHistoryRequest(Number(commandArgs[1]));
                this.sendHistoryRequest();
                break;

            case '/leave':
                this.sendLeaveRequest();
                break;

            case '/users':
                this.sendUsersListRequest();
                break;

            case '/add':
                if(this.checkArgc(commandArgs, 2))
                    this.sendAddFriendRequest(commandArgs[1]);
                this.sendAddFriendRequest();
                break;

            case '/accept':
              if(this.checkArgc())

            case '/pm':
                commandArgs = command.split(' ');
                if(this.checkArgc(commandArgs, 3))
                    this.sendPrivateMessageRequest(commandArgs[1], commandArgs[2]);
                this.sendPrivateMessageRequest();
                break;

            default:
                DisplayDriver.print(`You can't use ${commandArgs[0]} in a chat room\n`);
                break;

        };
    }

    parseCommand(command: string) {
        DisplayDriver.print(`Invalid command ${command} \n`);
    };

    public sendLoginRequest(username: string, password: string = '') {
        let loginPacket = {"username": username, "password": password};
        DisplayDriver.print('Login packet sent: ' + JSON.stringify(loginPacket) + '\n');

        this.username = username;
        this.socket.emit('login', JSON.stringify(loginPacket));
    }

    public sendAnonymousLoginRequest(username: string) {
        let loginPacket = {"username": username};
        DisplayDriver.print('Anonymous login sent: '+JSON.stringify(loginPacket)) + '\n';
        this.username = username;

        this.socket.emit('anonymousLogin', JSON.stringify(loginPacket));
    }

    public sendAsciiRequest() {
        this.socket.emit('ascii');
    }

    public sendRoomsListRequest() {
        this.socket.emit('listRoom');
        return;
    };

    public sendAddRoomRequest(roomName: string) {
        DisplayDriver.print('ADD ROOM\n')
        this.socket.emit('addRoom', roomName);
    }

    public sendJoinRequest(roomName: string = '') {
        if(roomName == '') {
            DisplayDriver.print('Invalid command /join \n');
            DisplayDriver.print('Usage: /join {room_name}\n');
            return;
        };

        this.socket.emit('joinRoom', roomName);
        return;
    };

    public sendHistoryRequest(messageCount: number = 0) {
        if(messageCount == NaN) {
            DisplayDriver.print('Invalid command /history \n');
            DisplayDriver.print('Usage: /history {message_count}');
            return;
        };

        if(messageCount == 0) {
            messageCount = 20;
        };

        this.socket.emit('history', messageCount);
        return;
    };

    public sendLeaveRequest() {
        this.socket.emit('leaveRoom');
        return;
    };

    public sendCreateRoomRequest(roomName: string = '') {
        if(roomName == '') {
            DisplayDriver.print('Invalid command /create \n');
            DisplayDriver.print('Usage: /create {room_name}\n');
            return;
        };

        this.socket.emit('addRoom', roomName);
        return;
    };

    public sendUsersListRequest() {
        this.socket.emit('listUser', this.roomName);
        return;
    };

    public sendPrivateMessageRequest(userName: string = '', message: string = '') {
        if(userName == '' || message == '') {
            DisplayDriver.print('Invalid command /pm \n');
            DisplayDriver.print('Usage: /pm {user_name} {message}\n');
            return;
        }

        this.socket.emit('pm', userName, message);
        return;
    };

    public sendAddFriendRequest(userName: string = '') {
        if(userName == '') {
            DisplayDriver.print('Invalid command /add \n');
            DisplayDriver.print('Usage: /add {user_name}\n');
            return;
        };

        this.socket.emit('addFriend', userName);
        return;
    };

    public sendMessage(message: string) {
    let data = {'room_name': this.roomName,
                'message': message};
        this.socket.emit('msg', JSON.stringify(data));
        return;
    };

};
