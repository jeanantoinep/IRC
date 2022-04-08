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
        //stdout.moveCursor(0, -1);
        stdout.write(msg + '\n');
        //this.rl.prompt(true);
    }

    static commandPrint(msg: string) {
        stdout.clearLine(0);
        stdout.cursorTo(0);
        stdout.write(msg);
        //stdout.moveCursor(0, 1);
        //console.log(this.currentPrompt)
        stdout.write(this.currentPrompt);
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

    static formatChatMessage(timestamp: string, username: string, message: string, guest: boolean = false): string {

        return(`${timestamp} ${('<@'+username+'>').padStart(15, ' ')} ${message}`);
    }

    static formatPrivateMessage(timestamp: string, username: string, message: string): string {
        return(`${timestamp} ${('<@'+username+'>').padStart(15, ' ')} ${message}`);
    }

    static formatInfoJoin(timestamp: string, username: string): string {
        return(`${timestamp} <@${username}> entered the chat !`);
    }

    static formatInfoLeave(timestamp: string, username: string, reason: string): string {
        return(`${timestamp} <@${username}> left the chat (${reason}) !`);
    }
}
