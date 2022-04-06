import ServerConnection from "../connections/serverConnection";
import Config from "../config";
import DisplayDriver from "../Display/displayDriver";

enum ClientPhase {
    load = 1,
    login,
    roomList,
    chat,
}

export default class Core{
    private connection: ServerConnection =  new ServerConnection();

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
}