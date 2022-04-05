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
    // socket.emit("addRoom", 'New Room')

    // to get all rooms
    socket.emit("listRoom")

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


interface ServerToClientEvents {
    login: (data: string) => void;
    listRoom: (data: string) => void;
    joinRoom: (data: string) => void; // room joined successfully ou erreur
    history: (data: string) => void;
    msg: (data: string) => void;
    leaveRoom: (data: string) => void; // [toto] has left the chat ou [toto] connection lost
    addRoom: (data: string) => void; // succès ou erreur
    listUser: (data: string) => void;
    pm: (data: string) => void; // seulement le message à l'envoyeur et au receveur
    addFriend: (data: string) => void; // demande d'ami : pour accepter /accept ?
}

interface ClientToServerEvents {
    handshake: (callback: (data: string) => void) => void;
    login: (userData: string) => void; // username pour invité ou username + password pour personne enregistrée
    listRoom: () => void;
    joinRoom: (roomName: string) => void;
    history: (data: string) => void; // 50 msg par défaut ? sinon nombre précisé
    msg: (data: string) => void;
    leaveRoom: () => void;
    addRoom: (roomName: string) => void;
    listUser: () => void;
    pm: (data: string) => void; // nom user + message
    addFriend: (username: string) => void;
}