import Core from "./Core/core";
import readline from 'readline'

let test = 0;



// test = 1;

// let rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//     prompt: '> ',
//     //terminal: true
// });


// async function query() {
//     let answer = await new Promise<string>((resolve, reject) => {
//         rl.question("TEST INPUT", (input) => {
//             resolve(input);
//             //rl.close();
//         } );
//     });
// }



function main() {
    new Core();
    //query();
}

main();
