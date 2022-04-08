import ServerConnection from "../Connections/serverConnection";
import Config from "../config";
import DisplayDriver from "../Display/displayDriver";
import { ClientMessageHandler } from "../Connections/clientMessageHandler";
import { ServerMessageHandler } from "../Connections/serverMessageHandler";

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
    private serverBannerSize: number = 0;

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
        this.serverBannerSize = (banner.match(/\n/g) || '').length + 1;
    }

    public getServerBannerSize() {
        return this.serverBannerSize;
    }

    public async startLoginPhase() {
        DisplayDriver.print('\n')
        this.clientMessageHandler.startLoginProcess();
        this.clientMessageHandler.setPhase(Phase.login);
    }

    public async startRoomsListPhase() {
        DisplayDriver.clearTerminal();
        DisplayDriver.print(this.serverBanner);
        DisplayDriver.setCurrentPrompt('> ');
        this.clientMessageHandler.sendRoomsListRequest();
        this.clientMessageHandler.setPhase(Phase.roomList);
    }

    public startChatPhase() {
        DisplayDriver.clearTerminal();
        this.clientMessageHandler.setPhase(Phase.chat);
        DisplayDriver.startChat();
    }

    consolePhase(arg: Phase) {
        switch (arg) {
            case Phase.load:
                break;

            case Phase.login:
                this.startLoginPhase()
                break;

            case Phase.roomList:
                this.startRoomsListPhase()
                break;

            case Phase.chat:
                this.startChatPhase();
                break;

          default:
              break;
        };
    };
};
