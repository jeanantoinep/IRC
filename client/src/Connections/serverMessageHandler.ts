import DisplayDriver from "../Display/displayDriver";
import {ServerToClientEvents, ClientToServerEvents} from './socketEvents'
import {Socket} from 'socket.io-client'

import { ClientMessageHandler } from "./clientMessageHandler";
import Core, {Phase} from '../Core/core'

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
        this.socket.on('addFriend', (data:string) => this.recvAddFriend(data));
        this.socket.on('addRoom', (data:string) => this.recvAddRoom(data));
        this.socket.on('connect', ()=> this.recvConnect());
        this.socket.on('connect_error', async (err: Error) => await this.recvConnectError(err));
        this.socket.on('disconnect', (reason: Socket.DisconnectReason) => this.recvDisconnect(reason));
        this.socket.on('history', (data: string) => this.recvHistory(data));
        this.socket.on('joinRoom', (data: string) => this.recvJoinRoom(data));
        this.socket.on('leaveRoom', (data: string) => this.recvLeaveRoom(data));
        this.socket.on('listRoom', (data: string) => this.recvListRoom(data));
        this.socket.on('listUser', (data: string) => this.recvListUsers(data));
        this.socket.on('login', (data: string) => this.recvLogin(data))
        this.socket.on('msg', (data:string) => this.recvMessage(data));
        this.socket.on('ascii', (data: string) => this.recvAsciiBanner(data));
    }

    recvAsciiBanner(data: string) {
        DisplayDriver.print(data);
        DisplayDriver.print('\n');
    }

    recvConnect() {
        this.core.consolePhase(Phase.login);
        this.clientHandler.sendAsciiRequest();
    }

    async recvConnectError(err: Error) {
        DisplayDriver.print('Socket connection error: ' + err);
        DisplayDriver.print('\n');
    }

    recvDisconnect(reason: Socket.DisconnectReason) {

    }

    async recvLogin(data: string) {
        let returnData = JSON.parse(data);

        if(returnData['result'] == 'need_pwd') {
            let len = 0;
            let passwd = '';
            while(len < 5) {
                passwd = await DisplayDriver.createPrompt(`Password :`);
                len = passwd.length;
            }
            this.clientHandler.sendLogin(this.clientHandler.getUsername(), passwd);
        }

        if(returnData['result'] == 'need_auth') {
            let answer = await DisplayDriver.createPrompt(`Username isn't registered: do you want to claim it ? (yes/no) :`);

            if(answer.startsWith('y')) {
                let len = 0;
                while(len < 5) {
                    let pwd = await DisplayDriver.createPrompt(`Password :`);
                    len = pwd.length;
                }
                let pwd = await DisplayDriver.createPrompt(`Password :`);

                this.clientHandler.sendLogin(this.clientHandler.getUsername(), pwd);
            }
        }

        if(returnData['result'] == 'OK') {
            this.core.consolePhase(Phase.roomList);
        }
    }

    recvAddFriend(data: string) {
        
    }

    recvAddRoom(data: string) {
        console.log(data)
    }

    recvHistory(data: string) {

    }

    recvJoinRoom(data: string) {

    }

    recvLeaveRoom(data: string) {

    }

    recvListRoom(data: string) {
        console.log(JSON.parse(data))
    }

    recvListUsers(data: string) {

    }

    recvMessage(messageData: string) {
        let messageObject = JSON.parse(messageData);
        let messageType = messageObject['type'];

        if(messageType == 'message') {
            let timestamp = messageObject['timestamp'];
            let userName = messageObject['username'];
            let message = messageObject['message'];
            DisplayDriver.chat(`${timestamp} <@${userName}> ${message}`);
        }
        else if (messageType == 'join') {
            let timestamp = messageObject['timestamp'];
            let userName = messageObject['username'];
            DisplayDriver.chat(`${timestamp} <@${userName}> entered the chat !`);
        }
        else if (messageType == 'leave') {
            let timestamp = messageObject['timestamp'];
            let reason = messageObject['reason'];
            let userName = messageObject['username'];
            DisplayDriver.chat(`${timestamp} <@${userName}> left the chat (${reason}) !`);
        }
    }
}