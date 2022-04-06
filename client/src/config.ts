
export class Config {
    static configFilename = "TestConfig.json"

    static portNumber: number;
    static hostName: string;

    static setPort(port: number) {
        this.portNumber = port;
    }

    static setHostname(host: string) {
        this.hostName = host;
    }

    static loadConfig(filename: string) {
        //TODO: Load config.json from disk
    }

    static saveConfig(filename: string) {
        //TODO: save config.json to disk
    }

    static printConfig() {
        console.log(`Client mode! \nHostname: ${this.hostName}, Port: ${this.portNumber}`);
    }

}