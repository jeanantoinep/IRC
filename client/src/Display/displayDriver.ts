import { Console } from 'console';
import { stdout, stdin } from 'process';
import readline from 'readline'




export default class DisplayDriver {
    static rl: readline.Interface = this.createReadlineInterface();

    static shouldPrompt: boolean = false;

    static currentPrompt: string = '';

    static getDriver() {
        return this.rl;
    }

    static getCurrentPrompt() {
        return this.currentPrompt;
    }

    static setCurrentPrompt(prompt:string) {
        this.currentPrompt = prompt;
    }

    static createReadlineInterface() : readline.Interface {
        let rl = readline.createInterface({
            input: stdin,
            //output: stdout,
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
        stdout.write(this.currentPrompt);
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

    static getMaxWidth(str: string) {
        let maxwidth: number = 0;
        for(let line of str.split('\n')){
            maxwidth = line.length > maxwidth ? line.length : maxwidth;
        }
        return maxwidth;
    }


    static printBanner(banner: string, center: boolean, clear: boolean) {
        if(clear)
            DisplayDriver.clearTerminal();
        if(!center)
            DisplayDriver.print(banner);
        else {
            let terminalWidth = stdout.columns;
            let offset = (terminalWidth - 96) /2;
            let lines = banner.split('\n');

            //DisplayDriver.print(banner)
            for(let line of lines) {
                stdout.cursorTo(offset);
                DisplayDriver.print(line)
                DisplayDriver.print('\n');
            }
        }
        DisplayDriver.print('\n');
    }

    static chat(msg: string) {
        stdout.clearLine(0);
        stdout.cursorTo(0);
        stdout.write(msg + '\n');
    }

    static commandPrint(msg: string) {
        stdout.clearLine(0);
        stdout.cursorTo(0);
        stdout.write(msg);
        this.rl.line = this.currentPrompt;
    }

    static print(msg: string) : void {
        //let currentLine = this.rl.line;
        //stdout.moveCursor(5, 0);
        stdout.write(msg);
        //stdout.write(currentLine);
    }

    static async createPrompt(message: string) {
        DisplayDriver.print(message);
        this.currentPrompt = message;
        let answer =  await new Promise<string>((resolve, reject) => {
            this.rl.question(message, (input) => {
                this.currentPrompt = '';
                //DisplayDriver.print('\n');
                resolve(input);
            });
        });
        return answer;
    }

    static clearTerminal() {
        readline.cursorTo(stdout, 0, 0);
        readline.clearScreenDown(stdout);
    }

    static moveCursor(dx: number, dy: number = 0) {
        readline.moveCursor(stdout, dx, dy);
    }

    static getCursorPos() {
        //return this.rl.getCursorPos();
        return this.rl.cursor
    }

    static formatChatMessage(timestamp: string, 
                             username: string, 
                             message: string, 
                             guest: boolean = false,
                             self = false): string {

        let line = timestamp + ' ';
        if(self) line += ('<\x1b[31m@' + username + '\x1b[0m>').padStart(15, ' ');
        else line += ('<\x1b[32m@' + username + '\x1b[0m>').padStart(15, ' ');
        line += message;
        return line;
    }

    static formatPrivateMessage(timestamp: string, username: string, message: string): string {
        let line = timestamp + ' ';
        line += ('<#' + username + '>').padStart(15, ' ');
        line += message;
        return line;
    }

    static formatInfoJoin(timestamp: string, username: string): string {
        let line = timestamp + ' ';
        line += ''.padStart(15, '-');
        line += username + 'entered the chat !'
        return line;
    }

    static formatInfoLeave(timestamp: string, username: string, reason: string): string {
        let line = timestamp + ' ';
        line += ''.padStart(15, ' ');
        line += username + 'entered the chat !'
        line += '(' + reason + ')';
        return line
    }
}
