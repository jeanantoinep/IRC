import { stdout, stdin } from 'process';

import DisplayDriver from "../Display/displayDriver";
import { ServerToClientEvents, ClientToServerEvents } from './socketEvents';
import { Socket } from 'socket.io-client';

import { Phase } from "../Core/core";

export class ClientMessageHandler {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    private phaseCommandHandler: (command: string) => void;

    //Phase data
    private currentPhase: Phase = Phase.load;
    //Client data
    private username: string = '';
    private roomName: string = '';

    //Message data
    private inputData: string = '';

    constructor(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
        this.socket = socket;
        this.phaseCommandHandler = this.parseCommand;

        this.initInputHandlers();
    };

    private printCharacter(input: string) {
        if (input != undefined) {
            this.inputData += input;
            stdout.write(input);
        }
    }

    private printEol() {
        //console.log('EOL Detected, line: ' + this.inputData)
        this.parseMessage(this.inputData);
        this.inputData = '';
        stdout.cursorTo(0);
        stdout.moveCursor(0, 1);
        stdout.write(DisplayDriver.getCurrentPrompt());
        stdout.clearLine(0);
        //stdout.moveCursor(0, -1);
    }

    private printCharRemoval() {
        this.inputData = DisplayDriver.getDriver().line;
        stdout.cursorTo(0);
        stdout.write(DisplayDriver.getCurrentPrompt());
        stdout.write(this.inputData);
        stdout.clearLine(1);
        //stdout.moveCursor(1, 0);
    }

    private initInputHandlers() {
        stdin.on('SIGTERM', (data: Buffer) => {
            process.exit(1);
        });

        // stdin.on('keypress', (...input) => {
        stdin.on('keypress', (...data: any) => {
            let char: string = data[0];
            let sequence: string = data[1].sequence;
            let name = data[1].name;

            if (name == 'return' && this.inputData != '') {//End of line detection
                this.printEol();
                return;
            }

            if (name == 'backspace' || name == 'delete') {//Character removal
                this.printCharRemoval();
                return;
            }

            this.printCharacter(char)

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
        switch (phase) {
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

        if (this.currentPhase != Phase.chat &&
            this.currentPhase != Phase.roomList)
            return;

        if (message.startsWith('/'))
            return this.phaseCommandHandler(message);

        else if (this.currentPhase == Phase.chat) {
            this.sendMessage(message);
            DisplayDriver.resumeInput();
        }
    };

    checkArgc(args: string[], count: number) {
        return (args.length == count);
    };

    roomListCommandHandler(command: string) {
        let commandArgs = command.split(' ', 2);

        switch (commandArgs[0].toLowerCase()) {
            case '/rooms':
                this.sendRoomsListRequest();
                break;

            case '/join':
                if (this.checkArgc(commandArgs, 2))
                    this.sendJoinRequest(commandArgs[1])
                break;

            case '/create':
                if (this.checkArgc(commandArgs, 2))
                    this.sendCreateRoomRequest(commandArgs[1]);
                this.sendCreateRoomRequest();
                break;

            case '/help':
                this.showRoomListCommands();
                break;

            default:
                DisplayDriver.commandPrint(`You can't use ${commandArgs[0]} in the room selection\n`);
                break;
        }

    }

    showRoomListCommands() {
        DisplayDriver.commandPrint('Available options:\n'
            + '\t\t/join {room name} => Joins an existing room\n'
            + '\t\t/create {room name} => Creates a new room\n')
    }

    chatRoomCommandHandler(command: string) {
        let commandArgs = command.split(' ', 2);

        switch (commandArgs[0]) {
            case '/join':
                if (this.checkArgc(commandArgs, 2))
                    this.sendJoinRequest(commandArgs[1])
                break;

            case '/history':
                if (this.checkArgc(commandArgs, 2))
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
                if (this.checkArgc(commandArgs, 2))
                    this.sendAddFriendRequest(commandArgs[1]);
                this.sendAddFriendRequest();
                break;

            case '/accept':
                //if(this.checkArgc())
                break;

            case '/pm':
                commandArgs = command.split(' ', 2);
                let userName = commandArgs[1];
                let message = command.substring(commandArgs[1].length + 4);
                this.sendPrivateMessageRequest(userName, message);
                break;

            default:
                DisplayDriver.print(`You can't use ${commandArgs[0]} in a chat room\n`);
                break;

        };
    }

    async startLoginProcess() {
        let login = await DisplayDriver.createPrompt('Username: ');
        if (login.length == 0) {
            this.startLoginProcess()
            return;
        }
        this.sendLoginRequest(login);
    }

    parseCommand(command: string) {
        DisplayDriver.print(`Invalid command ${command} \n`);
    };

    public sendLoginRequest(username: string, password: string = '') {
        let loginPacket = { "username": username, "password": password };
        this.username = username;
        this.socket.emit('login', JSON.stringify(loginPacket));
    }

    public sendRegisterRequest(username: string, password: string) {
        let registerPacket = { "username": username, "password": password };

        this.username = username;
        this.socket.emit('register', JSON.stringify(registerPacket));
    }

    public sendAnonymousLoginRequest(username: string) {
        let loginPacket = { "username": username };
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
        this.socket.emit('addRoom', roomName);
    }

    public sendJoinRequest(roomName: string = '') {
        console.log('room name: ' + roomName)
        if (roomName.length == 0) {
            DisplayDriver.print('Invalid command /join \n');
            DisplayDriver.print('Usage: /join {room_name}\n');
            return;
        };

        this.socket.emit('joinRoom', roomName);
        return;
    };

    public sendHistoryRequest(messageCount: number = 0) {
        if (messageCount == NaN) {
            DisplayDriver.print('Invalid command /history \n');
            DisplayDriver.print('Usage: /history {message_count}');
            return;
        };

        if (messageCount == 0) {
            messageCount = 20;
        };

        var data = {
            "room_name": this.roomName,
            "message_count": messageCount
        };
        this.socket.emit('history', JSON.stringify(data));
        return;
    };

    public sendLeaveRequest() {
        this.socket.emit('leaveRoom',"");
        return;
    };

    public sendCreateRoomRequest(roomName: string = '') {
        if (roomName == '') {
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
        if (userName == '' || message == '') {
            DisplayDriver.print('Invalid command /pm \n');
            DisplayDriver.print('Usage: /pm {user_name} {message}\n');
            return;
        }

        let data = {
            'receiver_name': userName,
            'message': message,
        }

        this.socket.emit('pm', JSON.stringify(data));
        return;
    };

    public sendAddFriendRequest(userName: string = '') {
        if (userName == '') {
            DisplayDriver.print('Invalid command /add \n');
            DisplayDriver.print('Usage: /add {user_name}\n');
            return;
        };

        this.socket.emit('addFriend', userName);
        return;
    };

    public sendMessage(message: string) {
        this.socket.emit('msg', JSON.stringify({ "room_name": this.roomName, "message": message }));
        return;
    };

};
