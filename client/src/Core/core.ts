import ServerConnection from "../Connections/serverConnection";
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
        this.connection.tryConnect();
    }
}