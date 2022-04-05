import {cwd} from 'process'

let configFilename = "TestConfig.json"

export default class Config {

    static portNumber: number = 0;
    static hostName: string = '';

    static setPort(port: number) {
        this.portNumber = port;
    }

    static setHostname(host: string) {
        this.hostName = host;
    }

    static loadConfig(filename: string) {
        //TODO: Load config.json from disk
    }

    static saveConfig(filename: string = configFilename) {
        let workingDir = process.cwd();
        let savePath = workingDir + './' + filename;

        let jsonData = JSON.stringify( {
            "port:": this.portNumber, 
            "host": this.hostName });

        console.log("Data")
        console.log(jsonData);

        //TODO: save config.json to disk
    }

    static printConfig() {
        console.log(`CLient mode! Hostname: ${this.hostName}, Port: ${this.portNumber}`);
    }

}