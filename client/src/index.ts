import process from "process";
import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from './connections/socketEvents'


import { Config } from './config'

function LoadConfig() {
    const args = process.argv.slice(2);

    args.forEach((argument, index) => {
        // if (!argument.startsWith('-'))
        //     return;
        switch (argument) {
            case 'p':
                if (Number(args[index + 1]) != NaN) {
                    Config.setPort(Number(args[index + 1]));
                }   
                else console.log(`Invalid port number: ${args[index + 1]}`)
                break;
            case 'h':
                Config.setHostname(args[index + 1]);
                break;
        }
    })

    Config.printConfig();
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
    // to create a new room
    // socket.emit("addRoom", 'La Room')

    // to get all rooms
    // socket.emit("listRoom")

    socket.on("addRoom", (data: string) => {
        console.log(JSON.parse(data))
    })

    socket.on("listRoom", (data: string) => {
        console.log(JSON.parse(data))
    })
}


function main() {
    LoadConfig();
    const socket = Connect();
    Interacting(socket);
}


main()
