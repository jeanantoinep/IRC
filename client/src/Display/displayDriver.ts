import { stdout, stdin } from 'process';
import readline from 'readline'




export default class DisplayDriver {
    static rl: readline.Interface = this.createReadlineInterface();

    static shouldPrompt: boolean = false;

    static getDriver() {
        return this.rl;
    }

    
    static createReadlineInterface() : readline.Interface {
        let rl = readline.createInterface({
            input: stdin,
            //output: stdout,
            prompt: '> ',
            terminal: true,
        });

        readline.emitKeypressEvents(stdin);

        return rl;
    }

    static destroyReadlineInterface(rl: readline.Interface) {

    }

    static pauseInput() {
        this.rl.pause();
        this.shouldPrompt = false;
    }

    static resumeInput() {
        this.rl.resume();
        //stdout.write('> ');
    }

    static enableInput() {
    }

    static enableMessageInput(){
        stdout.write('> ');
    }

    static printList(list: string[]) {

    }

    static leaveChat() {
        this.enableInput();
    }

    static startChat() {
        let rowsCount = stdout.rows
        while(rowsCount) {
            DisplayDriver.print('\n');
            rowsCount--;
        }
        this.enableMessageInput()
    }

    static scrollDown(currentRow: number) {
        let rowsCount = stdout.rows - currentRow;
        while(rowsCount) {
            DisplayDriver.print('\n');
            rowsCount--;
        }
    }

    static chat(msg: string) {
        stdout.clearLine(0);
        stdout.cursorTo(0);
        stdout.moveCursor(0, -1);

        stdout.write(msg + '\n');
        stdout.write('\n');
        //stdout.moveCursor(0, 1);
        //this.rl.prompt(true);
    }

    static print(msg: string) : void {
        stdout.write(msg);
    }

    static async createPrompt(message: string) {
        DisplayDriver.print(message);
        let answer =  await new Promise<string>((resolve, reject) => {
            this.rl.question(message, (input) => {
                resolve(input);    
            });
        });
        return answer;
    }

    static clearTerminal() {
        readline.cursorTo(stdout, 0, 0);
        readline.clearScreenDown(stdout);
    }

}