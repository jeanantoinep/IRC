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

    static printTable(list: any, col: number = 1) {
        let table: string[] = [];
        let line = '';
        list.forEach((value: any, index: number) => {
            if(index % col != 0 || index == 0) {
                line += '#' + value['name'].padEnd(10, ' ');
                line += ' '.padEnd(5, ' ');
                return;
            }

            if(index % col == 0 && index != 0) {
                line += '#' + value['name']
                line += '\n';
                table.push(line);
                line = '';
            }
        });
        table.push(line);
        table.forEach((line:string) => {
            let offset = Math.floor((stdout.columns - (line.length)) /2);
            stdout.cursorTo(offset);
            this.print(line);
            this.print('\n')
        })
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
        //Header: 25 char
        if(msg.length > stdout.columns -1)
        {
            stdout.clearLine(0);
            stdout.cursorTo(0);
            let lines: string[] = [];
            let message = msg;
            let index = 0;
            while(message.length != 0) {
                if(index == 0) {
                    let substr = message.substring(0, stdout.columns)
                    lines.push(substr);
                    message = message.substring(substr.length);
                }
                else {
                    let substr = ''.padStart(25, ' ') + message.substring(0, stdout.columns -25)
                    if(substr.startsWith(' '))
                        substr = substr.substring(1);

                    lines.push(substr);
                    message = message.substring(substr.length);
                }
                index++;
            }
            stdout.cursorTo(0);
            stdout.moveCursor(0, -lines.length + 1);
            stdout.clearScreenDown();
            //console.log(lines)
            lines.forEach((line:string) => {
                stdout.clearLine(0);
                stdout.cursorTo(0);
                stdout.write(line + '\n');
            })
        }
        else {
            stdout.clearLine(0);
            stdout.cursorTo(0);
            stdout.write(msg + '\n');
        }
    }

    static commandPrint(msg: string) {
        stdout.clearLine(0);
        stdout.cursorTo(0);
        stdout.write(msg);
        this.rl.line = this.currentPrompt;
    }

    static print(msg: string, center:boolean = false) : void {
        //let currentLine = this.rl.line;
        //stdout.moveCursor(5, 0);
        if(center) {
            let offset = Math.floor((stdout.columns - msg.length) /2);
            stdout.cursorTo(offset);
        }
        stdout.write(msg);
        //stdout.write(currentLine);
    }

    static dump(data: any) {
        stdout.write(data);
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
        return this.rl.cursor
    }

    static formatChatMessage(timestamp: string,
                             username: string,
                             message: string,
                             guest: boolean = false,
                             self = false): string {

        let line = timestamp + ' ';
        let prefix = guest ? '+' : '@';
        if (self)
          line += String('<\x1b[32m' + prefix + username + '\x1b[0m> ').padStart(25, ' ');
        else
          line += String('<\x1b[31m' + prefix + username + '\x1b[0m> ').padStart(25, ' ');
        line += message;
        return line;
    }

    static formatHistoryMessage(timestamp: string,
                            username: string,
                            message: string): string {

        let line = '\u001b[38;5;245m' + timestamp + ' ';
        line += String('<' + username + '> ').padStart(16, ' ');
        line += message + '\u001b[0m';
        return line;
    }

    static formatPrivateMessage(timestamp: string, username: string, message: string): string {
        let line = '\u001b[7m' + timestamp + ' ';
        let userName = String('<#' + username + '> ').padStart(16, ' ');
        line += userName;
        line += message;
        line += '\u001b[0m';
        return line;
    }

    static formatInfoJoin(timestamp: string, username: string): string {
        let line = timestamp + ' ';
        line += ''.padStart(16, ' ');
        line += username + ' entered the chat !'
        return line;
    }

    static formatInfoLeave(timestamp: string, username: string, reason: string): string {
        let line = timestamp + ' ';
        line += ''.padStart(16, ' ');
        line += username + ' left the chat ! '
        line += '(' + reason + ')';
        return line
    }
}
