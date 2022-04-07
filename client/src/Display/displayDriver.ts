import { stdout } from 'process';
import readline from 'readline'

let rl : readline.Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
    terminal: false,
});

export default class DisplayDriver {

    static shouldPrompt: boolean = false;

    static getDriver() {
        return rl;
    }

    static pauseInput() {
        rl.pause();
        this.shouldPrompt = false;
    }

    static resumeInput() {
        rl.resume();
    }
    static enableInput() {
        rl.prompt(true);
        this.shouldPrompt = true;
    }

    static printList(list: string[]) {

    }

    static startChat() {
        let rowsCount = process.stdout.rows
        while(rowsCount) {
            DisplayDriver.print('\n');
            rowsCount--;
        }
            //readline.cursorTo(process.stdout, 0, rowsCount);
        this.enableInput();
    }

    ///CHAT: Essayer avec stdin.write avec un \n à la fin, pour écrire en bas du terminal
    static chat(msg: string) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        //console.log(msg);

        //process.stdin.write(msg + '\n');
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
        if(this.shouldPrompt) {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            //this.pauseInput();
        }

        process.stdout.write(msg);

        if(this.shouldPrompt) {
            rl.prompt(true);
        }
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
        readline.cursorTo(process.stdout, 0, 0);
        readline.clearScreenDown(process.stdout);
    }

}