import { stdout, stdin } from 'process';
import readline from 'readline'

process.stdin.setRawMode(true);

function createReadlineInterface() : readline.Interface {
    return readline.createInterface({
        input: stdin,
        output: stdout,
        prompt: '> ',
        terminal: true,
    });
}

function destroyReadlineInterface(rl: readline.Interface) {
    rl.close;
}

process.stdin.on('SIGTERM', (data: Buffer) => {

    //if(data == '\n')
    process.stdout.write(data)
})

process.stdin.on('data', (data: Buffer) => {

    //if(data == '\n')
    process.stdout.write(data)
})

export default class DisplayDriver {
    static rl: readline.Interface = createReadlineInterface();

    static shouldPrompt: boolean = false;

    static getDriver() {
        return this.rl;
    }

    static pauseInput() {
        this.rl.pause();
        this.shouldPrompt = false;
    }

    static resumeInput() {
        this.print('>');
        this.rl.resume();
    }
    static enableInput() {
        this.print('>');
        this.rl.prompt(true);
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

        process.stdout.write(msg + '\n');
        this.rl.prompt(true);
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
            this.rl.prompt(true);
        }
    }

    static async createPrompt(message: string) {
        //this.print(message)
        let answer =  await new Promise<string>((resolve, reject) => {
            this.rl.question(message, (input) => {
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