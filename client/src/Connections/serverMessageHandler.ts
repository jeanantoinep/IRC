import DisplayDriver from "../Display/displayDriver";
import {ServerToClientEvents, ClientToServerEvents} from './socketEvents'
import {Socket} from 'socket.io-client'

import { ClientMessageHandler } from "./clientMessageHandler";

export class ServerMessageHandler {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private clientHandler: ClientMessageHandler;

    constructor(socket: Socket<ServerToClientEvents, ClientToServerEvents>,
                clientHandler: ClientMessageHandler) {
        this.socket = socket;
        this.clientHandler = clientHandler;
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
        console.log('OK')
    }

    async recvConnectError(err: Error) {
        DisplayDriver.print('Socket connection error: ' + err);

        for(let i = 5 ; i > 0 ; i--) {
            DisplayDriver.printOnLine(`Retrying in ${i} seconds ...`, 1);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        DisplayDriver.print('\n');
        this.socket.connect();
    }

    recvDisconnect(reason: Socket.DisconnectReason) {

    }

    async recvLogin(data: string) {
        let returnData = JSON.parse(data);

        if(returnData['result'] == 'need_pwd') {
            let passwd = await DisplayDriver.createPrompt('Password: ');
        }
    }

    recvAddFriend(data: string) {
        
    }

    recvAddRoom(data: string) {

    }

    recvHistory(data: string) {

    }

    recvJoinRoom(data: string) {

    }

    recvLeaveRoom(data: string) {

    }

    recvListRoom(data: string) {

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