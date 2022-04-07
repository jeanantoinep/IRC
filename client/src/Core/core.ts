import ServerConnection from "../Connections/serverConnection";
import Config from "../config";
import DisplayDriver from "../Display/displayDriver";
import { ClientMessageHandler } from "../Connections/clientMessageHandler";
import { ServerMessageHandler } from "../Connections/serverMessageHandler";
import { Socket } from "socket.io-client";
import { Server } from "http";
import { rawListeners } from "process";

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

    private serverBanner: string = '';

    constructor() {
        Config.initConfig();
        this.connection = new ServerConnection();

        this.clientMessageHandler = new ClientMessageHandler(this.connection.getSocket());
        this.serverMessageHandler = new ServerMessageHandler(
                                        this.connection.getSocket(), 
                                        this.clientMessageHandler,
                                        this);
    };

    public setServerBanner(banner: string) {
        this.serverBanner = banner;
    }

    public async startLoginPhase() {
        let login = await DisplayDriver.createPrompt('Login: ');
        this.clientMessageHandler.sendLoginRequest(login);
    }

    public async startRoomsListPhase() {
        this.clientMessageHandler.sendRoomsListRequest();

    }

    consolePhase(arg: Phase) {
        switch (arg) {
            case Phase.load:
                break;

            case Phase.login:
                DisplayDriver.print('\n')
                this.startLoginPhase()
                break;

            case Phase.roomList:
                DisplayDriver.clearTerminal();
                DisplayDriver.print(this.serverBanner);
                this.startRoomsListPhase()
                break;

            case Phase.chat:
                DisplayDriver.startChat();
                break;

          default:
              break;
        };
    };
};
