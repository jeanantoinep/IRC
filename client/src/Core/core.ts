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
        let login = await DisplayDriver.createPrompt('Username: ');
        this.clientMessageHandler.sendLoginRequest(login);
        this.clientMessageHandler.setPhase(Phase.login);
    }

    public async startRoomsListPhase() {
        this.clientMessageHandler.sendRoomsListRequest();
        this.clientMessageHandler.setPhase(Phase.roomList);
    }

    public startChatPhase() {
        console.log('CHAT PHASE')
        DisplayDriver.clearTerminal();
        this.clientMessageHandler.setPhase(Phase.chat);
        DisplayDriver.startChat();
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
                //DisplayDriver.clearTerminal();
                DisplayDriver.enableInput();
                this.startChatPhase();
                break;

          default:
              break;
        };
    };
};
