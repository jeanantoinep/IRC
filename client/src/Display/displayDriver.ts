import readline from 'readline'


let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
    //terminal: true
});

export default class DisplayDriver {

    static chat(msg: string) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log(msg);
        rl.prompt(true);
    }

    static printOnLine(msg: string, line: number = 1) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        //process.stdout.clearLine(0);
        process.stdout.write(msg);
        //process.stdout.moveCursor(msg.length, 0);
    }

    static print(msg: string) : void {
        process.stdout.write(msg);
   }
}