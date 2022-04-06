import process from "process"
import { io } from "socket.io-client";

import {Config} from './config'

function LoadConfig() {
    const args = process.argv.slice(2);

    args.forEach((argument, index) => {
        if(!argument.startsWith('-'))
            return;
        switch (argument) {
            case '-h':
                if(Number(args[index + 1]) != NaN)
                    Config.setPort(Number(args[index+1]));
                else console.log(`Invalid port number: ${args[index + 1]}`)
            break;
            case '-p':
                Config.setHostname(args[index + 1]);
            break;
            default:
              console.log('Invalid argument ' + argument);
          }
    })

    Config.printConfig();
}

function main() {
    LoadConfig();
}

main()

