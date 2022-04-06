import readline from 'readline'


let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
    //terminal: true
});

export default class DisplayDriver {

    static getDriver() {
        return rl;
    }

    static chat(msg: string) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log(msg);
        rl.prompt(true);
    }

    static printOnLine(msg: string, line: number = 1) {
        //process.stdout.pause();
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(msg);
        //process.stdout.resume();
    }

    static print(msg: string) : void {
        process.stdout.write(msg);
    }

    static async createPrompt(message: string) {
    let answer = new Promise((resolve, reject) => {
        rl.question(message, (input) => resolve(input) );
    });

    return answer;
   }
}