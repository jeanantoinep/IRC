import DisplayDriver from "../Display/displayDriver";
import {ServerToClientEvents, ClientToServerEvents} from './socketEvents';
import {io, Socket} from 'socket.io-client';

export class ClientMessageHandler {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    //Client data
    private username: string = '';

    constructor(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
        this.socket = socket;

        DisplayDriver.getDriver().on('line', (input:string) => {
            this.parseMessage(input);
        });
    };

    public getUsername() {
        return this.username;
    }

    parseMessage(message: string) {
        if(message.startsWith('/'))
            return this.parseCommand(message);
        else
            return this.sendMessage(message);
    };

    checkArgc(args: string[], count: number) {
        return (args.length == count);
    };

    parseCommand(command: string) {
        let commandArgs = command.split(' ', 2);

        switch(commandArgs[0]) {
            case '/rooms':
                this.sendRoomsListRequest();
                break;

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

            case '/create':
                if(this.checkArgc(commandArgs, 2))
                    this.sendCreateRoomRequest(commandArgs[1]);
                this.sendCreateRoomRequest();
                break;

            case '/users':
                this.sendUsersListRequest();
                break;

            case '/add':
                if(this.checkArgc(commandArgs, 2))
                    this.sendAddFriendRequest(commandArgs[1]);
                this.sendAddFriendRequest();
                break;

            case '/pm':
                commandArgs = command.split(' ');
                if(this.checkArgc(commandArgs, 3))
                    this.sendPrivateMessageRequest(commandArgs[1], commandArgs[2]);
                this.sendPrivateMessageRequest();
                break;

            case '/addRoom':
                this.sendAddRoomRequest(commandArgs[1]);
            break;


            default:
                DisplayDriver.print(`Invalid command ${commandArgs[0]} \n`);
                break;

        };
    };

    public sendLogin(username: string, password: string = '') {
        let loginPacket = {"username": username, "password": password};
        console.log('Login packet sent: ' + JSON.stringify(loginPacket));

        this.username = username;
        this.socket.emit('login', JSON.stringify(loginPacket));
    }

    public sendAsciiRequest() {
        this.socket.emit('ascii');
    }

    public sendRoomsListRequest() {
        this.socket.emit('listRoom');
        return;
    };

    public sendAddRoomRequest(roomName: string) {
        console.log('ADD ROOM')
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
        this.socket.emit('listUser');
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
        this.socket.emit('msg', message);
        return;
    };

};
