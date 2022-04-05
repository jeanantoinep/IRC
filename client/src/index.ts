import process from "process";
import { io, Socket } from "socket.io-client";

import { Config } from './config'

function LoadConfig() {
    const args = process.argv.slice(2);

    args.forEach((argument, index) => {
        if (!argument.startsWith('-'))
            return;
        switch (argument) {
            case 'h':
                if (Number(args[index + 1]) != NaN)
                    Config.setPort(Number(args[index + 1]));
                else console.log(`Invalid port number: ${args[index + 1]}`)
                break;
            case 'p':
                Config.setHostname(args[index + 1]);
                break;
            default:
                console.log('Invalid argument ' + argument);
        }
    })

    Config.printConfig();
}


interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
    hello: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
}


function Connect() {

    let url = `http://${Config.hostName}:${Config.portNumber}`
    // let socket = io(url);

    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(url);

    if (!socket.connected) {
        console.log(`Unable to connect to ${url}`);
        socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
        });
    } else {
        console.log(`Able to connect to ${url}`)
    }

    return socket;
}


function Interacting(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {

    socket.emit("hello");

    socket.on("noArg", () => {
        // ...
    });
    socket.on("basicEmit", (a, b, c) => {
        // a is inferred as number, b as string and c as buffer
        console.log("2 : basicEmit received from server")
    });
    socket.on("withAck", (d, callback) => {
        // d is inferred as string and callback as a function that takes a number as argument
    });

    socket.emit("basicEmit", 1, 'list_room', Buffer.from([3]))
}


function main() {
    LoadConfig();
    const socket = Connect();
    Interacting(socket);
}


main()

