import process from "process"
import Config from './config'
import ServerConnection from "./Connections/serverConnection";
import DisplayDriver from "./Display/displayDriver";

function LoadConfig() {
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

async function main() {
    LoadConfig();

    let mainConnection = new ServerConnection();

    let connectionStatus = await mainConnection.tryConnect();

    if(!connectionStatus) {
        DisplayDriver.print('Fatal error, aborting...');
        //process.exit(1)
    }
}

main()

