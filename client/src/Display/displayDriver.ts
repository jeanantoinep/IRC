import readline from 'readline'

let rl : readline.Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
    terminal: false,
});


export default class DisplayDriver {


    static getDriver() {
        return rl;
    }

    static startChat() {
        //console.clear();
        rl.prompt(true);
    }


    ///CHAT: Essayer avec stdin.write avec un \n à la fin, pour écrire en bas du terminal
    static chat(msg: string) {
        //process.stdout.clearLine(0);
        //process.stdout.cursorTo(0);
        //console.log(msg);

        process.stdin.write(msg + '\n');
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
        let answer =  await new Promise<string>((resolve, reject) => {
            rl.question(message, (input) => {
                resolve(input);    
            });
        });
        return answer;
    }

    static clearTerminal() {
        console.clear();
    }

}