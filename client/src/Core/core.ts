import ServerConnection from "../Connections/serverConnection";
import Config from "../config";
import DisplayDriver from "../Display/displayDriver";

export default class Core{
    private connection: ServerConnection =  new ServerConnection();

    async init() {
        this.LoadConfig()

        this.initServerConnection();
    }

    async initServerConnection() {
        let connectionStatus = await this.connection.tryConnect();
    
        if(!connectionStatus) {
            DisplayDriver.print('Fatal error, aborting...');
            //process.exit(1)
        }
    }
    
    LoadConfig() {
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
                default: console.log('Invalid argument ' + argument);
              }
        })
    }

    
    
}