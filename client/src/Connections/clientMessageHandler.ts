import { stdout, stdin } from 'process';

import DisplayDriver from "../Display/displayDriver";
import {ServerToClientEvents, ClientToServerEvents} from './socketEvents';
import {Socket} from 'socket.io-client';

import { Phase } from "../Core/core";

export class ClientMessageHandler {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    private phaseCommandHandler: (command:string) => void;

    //Phase data
    private currentPhase:Phase = Phase.load;
    //Client data
    private username: string = '';
    private roomName: string = '';

    //Message data
    private inputData: string = '';

    constructor(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
        this.socket = socket;
        this.phaseCommandHandler = this.parseCommand;

        //DisplayDriver.getDriver().on('keypress', (input:string) => {
        //    console.log('key: ' + input);
        //});

        this.initInputHandlers();
    };

    private initInputHandlers() {
        stdin.on('SIGTERM', (data: Buffer) => {
            process.exit(1);
        });

        stdin.on('data', (data: string) => {

            
            //console.log(data);
            //See: https://www.fileformat.info/info/charset/UTF-8/list.htm


            //if(data == '\u0008') { //Backspace
            //   process.stdout.write('\033c')
            //    process.stdout.moveCursor(-1, 0);
            //}

            //if(this.currentPhase != Phase.chat)
                //DisplayDriver.getDriver().write(data);



        });

        // stdin.on('keypress', (...input) => {
        stdin.on('keypress', (...data:any) => {
            //console.log(data);
            let char: string = data[0];
            let sequence: string = data[1].sequence;


            // if(this.currentPhase != Phase.chat &&
            //     this.currentPhase != Phase.roomList)
            //      return;

            if(sequence == '\b' || sequence == '\x1B[3~') {
                this.inputData = DisplayDriver.getDriver().line;
                stdout.clearLine(0);
                stdout.cursorTo(0);
                stdout.write('> ');
                stdout.write(this.inputData);
                //stdout.moveCursor(1, 0);
                return;
            }

            if(sequence == '\r') { //End of line detection
                //console.log('EOL Detected, line: ' + this.inputData)
                this.parseMessage(this.inputData);
                this.inputData = '';
                stdout.cursorTo(0);
                stdout.write('> ');
                stdout.clearLine(1);
                return;
            }

            if(char != undefined)
                this.inputData += char;

            if(this.currentPhase == Phase.chat) {
                //stdout.cursorTo(2);
                //stdout.write(DisplayDriver.getDriver().line);
                //return;
            }

            //stdout.cursorTo(0)
            stdout.write(char);

        });
    }

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
                this.currentPhase = Phase.roomList;
                break;

            case Phase.chat:
                this.phaseCommandHandler = this.chatRoomCommandHandler;
                this.currentPhase = Phase.chat;
                //this.initInputHandlers();
                break;

            default:
                break;
        }
    }

    parseMessage(message: string) {
        //console.log('PARSE MESSAGE ' + message)
        if(message.startsWith('/'))
            return this.phaseCommandHandler(message);
        else {
            this.sendMessage(message);
            DisplayDriver.resumeInput();
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

            case '/help':
                console.log('TEST')
                this.showRoomListCommands();
                break;

            default:
                DisplayDriver.print(`You can't use ${commandArgs[0]} in the room selection\n`);
                break;
        }

    }

    showRoomListCommands() {
        DisplayDriver.print(`Available options:
                            /join {room name} => Joins an existing room
                            /create {room name} => Creates a new room`)
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
