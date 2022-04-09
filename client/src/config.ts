import {cwd, argv} from 'process'

export class Config {
    static configFilename = "TestConfig.json"

    static portNumber: number = 0;
    static hostName: string = '';

    static setPort(port: number) {
        this.portNumber = port;
    }

    static setHostname(host: string) {
        this.hostName = host;
    }

    static initConfig() {
        const args = process.argv.slice(2);
        args.forEach((argument, index) => {
            //if(!argument.startsWith('-'))
                //return;
            switch (argument) {
                case 'p':
                    if(isNaN(Number(args[index+1]))) {
                        console.log('Invalid port number: ' + args[index+1])
                        process.exit(1);
                    }
                    else Config.setPort(Number(args[index+1]));
                break;
                case 'h': 
                    Config.setHostname(args[index+1]); 
                break;
                default: break;
              }
        })
    }


    static loadConfig(filename: string) {
        //TODO: Load config.json from disk
    }

    static saveConfig(filename: string) {
        //TODO: save config.json to disk
    }

    static printConfig() {
        console.log(`CLient mode! \nHostname: ${this.hostName}, Port: ${this.portNumber}`);
    }

}