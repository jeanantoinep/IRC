import DisplayDriver from "../Display/displayDriver";
import { ServerToClientEvents, ClientToServerEvents } from './socketEvents'
import { Socket } from 'socket.io-client'
import { rickRoll } from "../rick";

import { ClientMessageHandler } from "./clientMessageHandler";
import Core, { Phase } from '../Core/core'

export class ServerMessageHandler {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private clientHandler: ClientMessageHandler;
    private core: Core;

    constructor(socket: Socket<ServerToClientEvents, ClientToServerEvents>,
        clientHandler: ClientMessageHandler,
        core: Core) {
        this.socket = socket;
        this.clientHandler = clientHandler;
        this.core = core;

        this.init();
    }

    init() {
        this.socket.on('addFriend',     (data:string) => this.recvAddFriend(data));
        this.socket.on('acceptFriend',  (data: string) => this.recvAcceptFriend(data));
        this.socket.on('addRoom',       (data:string) => this.recvAddRoom(data));
        this.socket.on('connect',       ()=> this.recvConnect());
        this.socket.on('connect_error', (err: Error) => this.recvConnectError(err));
        this.socket.on('disconnect',    (reason: Socket.DisconnectReason) => this.recvDisconnect(reason));
        this.socket.on('history',       (data: string) => this.recvHistory(data));
        this.socket.on('joinRoom',      (data: string) => this.recvJoinRoom(data));
        this.socket.on('leaveRoom',     (data: string) => this.recvLeaveRoom(data));
        this.socket.on('listRoom',      (data: string) => this.recvListRoom(data));
        this.socket.on('listUser',      (data: string) => this.recvListUsers(data));
        this.socket.on('login',         (data: string) => this.recvLogin(data));
        this.socket.on('anonymousLogin', (data: string) => this.recvAnonymousLogin(data));
        this.socket.on('register',      (data: string) => this.recvRegister(data));
        this.socket.on('msg',           (data:string) => this.recvMessage(data));
        this.socket.on('ascii',         (data: string) => this.recvAsciiBanner(data));
        this.socket.on('pm',            (data: string) => this.recvPrivateMessage(data));
    }

    recvAsciiBanner(data: string) {
        this.core.setServerBanner(data);
        this.core.consolePhase(Phase.login);
    };

    recvConnect() {
        this.clientHandler.sendAsciiRequest();
    }

    recvPrivateMessage(data: string) {
        let returnData = JSON.parse(data);
        if (returnData['result'] == 'user_unknown') {
            DisplayDriver.print(`Unknown user: ${returnData['username']} !\n`)
            return;
        }
    }

    recvRegister(data: string) {
        let returnData = JSON.parse(data);
        if (returnData['result'] == 'username_exists') {
            DisplayDriver.print(`Username ${returnData['username']} already exists !\n`)
            return;
        }

        this.core.consolePhase(Phase.roomList);
    }

    recvConnectError(err: Error) {
        DisplayDriver.print('Socket connection error: ' + err + '\n');
    }

    recvDisconnect(reason: Socket.DisconnectReason) {

    }

    async recvLogin(data: string) {
        let returnData = JSON.parse(data);
        if (returnData['result'] == 'need_pwd') {
            let len = 0;
            let passwd = '';
            while (len < 1) {
                passwd = await DisplayDriver.createPrompt(`Password: `);
                len = passwd.length;
            }
            this.clientHandler.sendLoginRequest(this.clientHandler.getUsername(), passwd);
            return;
        }

        if (returnData['result'] == 'need_auth') {
            let answer = await DisplayDriver.createPrompt(`Username isn't registered: do you want to claim it ? (yes/no): `);
            let loop = true;
            let repeat = false;

            while (loop) {
                if (repeat) {
                    DisplayDriver.clearTerminal();
                    answer = await DisplayDriver.createPrompt(`Please answer yes or no:`);
                };
                if (answer === 'yes' || answer === 'y') {
                    let len = 0;
                    let pwd = '';
                    while (len < 3) {
                        DisplayDriver.clearTerminal();
                        pwd = await DisplayDriver.createPrompt(`Please enter a password with at least 3 characters: `);
                        console.log('entered password: ' + pwd)
                        len = pwd.length;
                    }
                    //let pwd = await DisplayDriver.createPrompt(`Password :`);
                    this.clientHandler.sendRegisterRequest(this.clientHandler.getUsername(), pwd);
                    loop = false;
                    return;
                } else if (answer === 'no' || answer === 'n') {
                    answer = await DisplayDriver.createPrompt(`Are you satisfied with the username ${this.clientHandler.getUsername()} (yes/no): `);
                    if (answer.startsWith('y')) {
                        this.clientHandler.sendAnonymousLoginRequest(this.clientHandler.getUsername());
                        return;
                    } else {
                        this.core.startLoginPhase();
                    };
                    loop = false;
                } else {
                    repeat = true;
                };
            };
        };

        if (returnData['result'] == 'wrong_pwd') {
            DisplayDriver.print('Invalid password !\n');
            this.core.startLoginPhase();
        };

        if (returnData['result'] == 'ok') {
            this.core.consolePhase(Phase.roomList);
        };
    };

    async recvAnonymousLogin(data: string) {
        let returnData = JSON.parse(data);
        if (returnData['result'] == 'ok') {
            this.core.consolePhase(Phase.roomList);
        };

        if (returnData['result'] == 'login_exists') {
            DisplayDriver.print('Username is already in use ! Please pick another one\n')
            let answer = await DisplayDriver.createPrompt(`Username: `);

        };
    };

    recvAddFriend(data: string) {

    };

    recvAcceptFriend(data: string) {

    };

    recvAddRoom(data: string) {
        let returnData = JSON.parse(data);
        if(returnData['result'] == 'success') {
            DisplayDriver.commandPrint(`Room ${returnData['room_name']} successfully created!\n`);
            DisplayDriver.commandPrint('Type /refresh to refresh the rooms list.\n');
            DisplayDriver.commandPrint(`Type /join ${returnData['room_name']} to join the room.\n`)
        }

    };

    recvHistory(data: string) {

    };

    recvJoinRoom(data: string) {
        console.log(data)
        let returnData = JSON.parse(data);

        if (returnData['result'] == 'ok') {
            this.core.consolePhase(Phase.chat);
            this.clientHandler.setRoomName(returnData['room_name']);
            return;
        };

        if (returnData['result'] == 'room_unknown')
            DisplayDriver.print(`Room ${returnData['room_name']} doesn't exist!\n`);
    };

    recvLeaveRoom(data: string) {
        DisplayDriver.leaveChat();
        this.core.consolePhase(Phase.roomList);
        //DisplayDriver.pauseInput();
    };

    recvListRoom(data: string) {
        DisplayDriver.print('Rooms list:\n')
        let roomsArray = JSON.parse(data);

        let rows = 0;
        roomsArray.forEach((room: any) => {
            DisplayDriver.print(room['name'] + '\n');
            rows++;
        });

        DisplayDriver.scrollDown(rows + this.core.getServerBannerSize());
        DisplayDriver.print(DisplayDriver.getCurrentPrompt());
    };

    recvListUsers(data: string) {
        DisplayDriver.print(data);
    };

    recvMessage(messageData: string) {
        let messageObject = JSON.parse(messageData);
        let messageType = messageObject['type'];

        if (messageType == 'message') {
            let timestamp = messageObject['timestamp'];
            let userName = messageObject['username'];
            let message = messageObject['message'];
            if (message == 'rickroll') {
              DisplayDriver.chat(rickRoll);
            } else if (userName == this.clientHandler.getUsername()) {
              DisplayDriver.chat(`${timestamp} <\x1b[32m@${userName}\x1b[0m> ${message}`);
            } else if (userName == 'Cocoleplusbo') {
                DisplayDriver.chat(`${timestamp} <\x1b[95m@${userName}\x1b[0m> ${message}`);
            } else {
                DisplayDriver.chat(`${timestamp} <\x1b[31m@${userName}\x1b[0m> ${message}`);
            };
        } else if (messageType == 'pm') {
            let formatedMessage = DisplayDriver.formatPrivateMessage(
                messageObject['timestamp'],
                messageObject['username'],
                messageObject['message']);
            DisplayDriver.chat(formatedMessage);

        } else if (messageType == 'join') {
            let timestamp = messageObject['timestamp'];
            let userName = messageObject['username'];
            DisplayDriver.chat(`${timestamp} <@${userName}> entered the chat !`);
        }
        else if (messageType == 'leave') {
            let timestamp = messageObject['timestamp'];
            let reason = messageObject['reason'];
            let userName = messageObject['username'];
            DisplayDriver.chat(`${timestamp} <@${userName}> left the chat (${reason}) !`);
        };
    };
};
