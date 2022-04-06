import DisplayDriver from "../Display/displayDriver";
import {ServerToClientEvents, ClientToServerEvents} from './socketEvents';
import {io, Socket} from 'socket.io-client';

export class ClientMessageHandler {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    constructor(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
        this.socket = socket;
    };

    init() {
        // let rlDriver = DisplayDriver.getDriver();
        // rlDriver.on('line', (input: string) => {
        //     return this.parseMessage(input);
        // });

    };

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

            default:
                DisplayDriver.print(`Invalid command ${commandArgs[0]} \n`);
                break;

        };
    };

    sendRoomsListRequest() {
        this.socket.emit('listRoom');
        return;
    };

    sendJoinRequest(roomName: string = '') {
        if(roomName == '') {
            DisplayDriver.print('Invalid command /join \n');
            DisplayDriver.print('Usage: /join {room_name}\n');
            return;
        };

        this.socket.emit('joinRoom', roomName);
        return;
    };

    sendHistoryRequest(messageCount: number = 0) {
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

    sendLeaveRequest() {
        this.socket.emit('leaveRoom');
        return;
    };

    sendCreateRoomRequest(roomName: string = '') {
        if(roomName == '') {
            DisplayDriver.print('Invalid command /create \n');
            DisplayDriver.print('Usage: /create {room_name}\n');
            return;
        };

        this.socket.emit('addRoom', roomName);
        return;
    };

    sendUsersListRequest() {
        this.socket.emit('listUser');
        return;
    };

    sendPrivateMessageRequest(userName: string = '', message: string = '') {
        if(userName == '' || message == '') {
            DisplayDriver.print('Invalid command /pm \n');
            DisplayDriver.print('Usage: /pm {user_name} {message}\n');
            return;
        }

        this.socket.emit('pm', userName, message);
        return;
    };

    sendAddFriendRequest(userName: string = '') {
        if(userName == '') {
            DisplayDriver.print('Invalid command /add \n');
            DisplayDriver.print('Usage: /add {user_name}\n');
            return;
        };

        this.socket.emit('addFriend', userName);
        return;
    };

    sendMessage(message: string) {
        this.socket.emit('msg', message);
        return;
    };

};
