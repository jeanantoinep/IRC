import process from "process"
import Config from './config'
import ServerConnection from "./Connections/serverConnection";

import readline from 'readline'

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
    //terminal: true
});

function LoadConfig() {
    const args = process.argv.slice(2);
    args.forEach((argument, index) => {
        if(!argument.startsWith('-'))
            return;
        switch (argument) {
            case '-p':
                if(isNaN(Number(args[index+1]))) {
                    console.log('Invalid port number: ' + args[index+1])
                    process.exit(1);
                }
                else Config.setPort(Number(args[index+1]));
            break;
            case '-h': 
                Config.setHostname(args[index+1]); 
            break;
            default: console.log('Invalid argument ' + argument);
          }
    })
}

async function main() {
    LoadConfig();

    let mainConnection = new ServerConnection();
  
    rl.prompt();

    rl.on('line', (line: string) => {
    switch (line.trim()) {
    case 'hello':
    console.log('world!');
    break;
    default:
    console.log(`Say what? I might have heard ${line.trim()}`);
    break;
    }
    //console.log(rl);
    rl.prompt();
}).on('close', () => {
console.log('Have a great day!');
process.exit(0);
});
    //if(!mainConnection.connect()) {
        //console.log('Fatal error, aborting...');
        //process.exit(1)
    //}
}

function DEBUG_drawPanel() {
    let rowCount = process.stdout.rows;
    let columsCount = process.stdout.columns;

    let firstColumnWidth = 30;
    let secondColumnWitdh = columsCount - firstColumnWidth;

    for(let row = 0; row < rowCount; row++) {
        for(let col = 0 ; col < columsCount ; col++) {
            if(row == 0 || row == rowCount-1) {
                process.stdout.write('*')
                continue;
            }
            else if ((col == 0 || col == columsCount-1) && row != 0) {
                process.stdout.write('*')
            }
            else if ((col == firstColumnWidth) && row != 0) {
                process.stdout.write('*')
            }
            //else if (col == firstColumnWidth) {
               // process.stdout.write('*')
            //}
            else {
                process.stdout.write(' ')
            }
        }
    }
}

function console_out(msg: any) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(msg);
    rl.prompt(true);
}

function myCallback() {
    //let text = process.stdin.read();

    // let textLength = process.stdin.read().length
    //console.log(rl);
    //process.stdout.clearLine(0);
    //process.stdout.clearLine(0);
    //process.stdout.cursorTo(0); 
    //process.stdin.pause();
    //process.stdout.cursorTo(0, process.stdout.rows - 2)
    //console.log('');
    //process.stdout.moveCursor(0, -1);
    //let test = process.stdout.read()
    //console.log(test);
    //process.stdout.
    //rl.pause();
    console_out('Line');
    //process.stdout.moveCursor(0, +1);
    //rl.resume();
    //rl.prompt(true);
}

//var intervalID = setInterval(prompt, 1000);

var intervalID = setInterval(myCallback, 5000);

//DEBUG_drawPanel()
main()

