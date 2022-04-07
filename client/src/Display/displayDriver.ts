import { stdout, stdin } from 'process';
import readline from 'readline'

let rl : readline.Interface = readline.createInterface({
    input: stdin,
    output: stdout,
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
        if(this.shouldPrompt)
            this.pauseInput();
        let rowsCount = process.stdout.rows
        while(rowsCount) {
            DisplayDriver.print('\n');
            rowsCount--;
        }
        //readline.cursorTo(process.stdout, 0, 0);
        this.enableInput();
    }

    ///CHAT: Essayer avec stdin.write avec un \n à la fin, pour écrire en bas du terminal
    static chat(msg: string) {
        stdout.clearLine(0);
        stdout.cursorTo(0);
        //console.log(msg);

        process.stdin.write(msg + '\n');
        rl.prompt(true);
    }

    static printOnLine(msg: string, line: number = 1) {
        //process.stdout.pause();
        stdout.clearLine(0);
        stdout.cursorTo(0);
        stdout.write(msg);
        //process.stdout.resume();
    }

    static print(msg: string) : void {
        if(this.shouldPrompt) {
            stdout.clearLine(0);
            stdout.cursorTo(0);
            //this.pauseInput();
        }

        stdout.write(msg);

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
        // let rowsCount = process.stdout.rows
        // while(rowsCount) {
        //     DisplayDriver.print('\n');
        //     rowsCount--;
        // }
        readline.cursorTo(stdout, 0, 0);
        readline.clearScreenDown(stdout);
    }

}