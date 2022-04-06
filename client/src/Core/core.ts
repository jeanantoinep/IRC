import ServerConnection from "../connections/serverConnection";
import Config from "../config";
import DisplayDriver from "../Display/displayDriver";
import { ClientMessageHandler } from "../Connections/clientMessageHandler";
import { ServerMessageHandler } from "../Connections/serverMessageHandler";
import { Socket } from "socket.io-client";

enum Phase {
    load = 1,
    login,
    roomList,
    chat,
};

enum ClientPhase {
    load = 1,
    login,
    roomList,
    chat,
}

export default class Core{
    private connection: ServerConnection =  new ServerConnection();
    private clientMessageHandler: ClientMessageHandler;
    private serverMessageHandler: ServerMessageHandler;
    constructor() {
      this.clientMessageHandler = new ClientMessageHandler(this.connection.getSocket());
      this.serverMessageHandler = new ServerMessageHandler(this.connection.getSocket(), this.clientMessageHandler);
    };

    async init() {
        Config.initConfig()
        this.initServerConnection();
    }

    async initServerConnection() {
        let connectionStatus = await this.connection.tryConnect();

        if(!connectionStatus) {
            DisplayDriver.print('Fatal error, aborting...');
            //process.exit(1)
        }
    }

    loadConfig() {
        const args = process.argv.slice(2);
        args.forEach((argument, index) => {
            if(!argument.startsWith('-'))
                return;
            switch (argument) {
                case '-p':
                    if(isNaN(Number(args[index+1]))) {
                        console.log('Invalid port number: ' + args[index+1])
                        process.exit(1);
                    }
                    else Config.setPort(Number(args[index+1]));
                    break;
                case '-h':
                    Config.setHostname(args[index+1]);
                    break;
                default:
                    console.log('Invalid argument ' + argument);
                    break;
              }
        })
    }

    consolePhase(arg: Phase) {
        switch (arg) {
          case Phase.load:
              console.clear();
              this.connection.getSocket()
              break;

          default:
              break;
        };
    };
};
