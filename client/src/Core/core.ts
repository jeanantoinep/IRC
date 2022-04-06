import ServerConnection from "../Connections/serverConnection";
import Config from "../config";
import DisplayDriver from "../Display/displayDriver";
import { ClientMessageHandler } from "../Connections/clientMessageHandler";
import { ServerMessageHandler } from "../Connections/serverMessageHandler";
import { Socket } from "socket.io-client";
import { Server } from "http";

export enum Phase {
    load = 1,
    login,
    roomList,
    chat,
};

export default class Core{
    private connection: ServerConnection;
    private clientMessageHandler: ClientMessageHandler;
    private serverMessageHandler: ServerMessageHandler;

    constructor() {
        Config.initConfig();
        this.connection = new ServerConnection();

        console.log(this.connection.getSocket())
        this.clientMessageHandler = new ClientMessageHandler(this.connection.getSocket());
        this.serverMessageHandler = new ServerMessageHandler(
                                        this.connection.getSocket(), 
                                        this.clientMessageHandler,
                                        this);
    };

    consolePhase(arg: Phase) {
        switch (arg) {
            case Phase.load:
                break;

            case Phase.login:
                DisplayDriver.clearTerminal();
                break;

            case Phase.roomList:
                DisplayDriver.clearTerminal();

            case Phase.chat:
                DisplayDriver.startChat();

          default:
              break;
        };
    };
};
