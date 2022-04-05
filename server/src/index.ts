import path from 'path';
import { Server } from 'socket.io'
import { createPool, Pool } from 'mysql';


interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
    hello: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
}

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    name: string;
    age: number;
}


const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(3000);

const MY_SQL_DB_HOST = 'localhost'
const MY_SQL_DB_USER = 'root'
const MY_SQL_DB_PASSWORD = 'admin'
// const MY_SQL_DB_PORT=3306
const MY_SQL_DB_DATABASE = 'irc'

let pool: Pool;
function init() {
    try {
        pool = createPool({
            host: MY_SQL_DB_HOST,
            user: MY_SQL_DB_USER,
            password: MY_SQL_DB_PASSWORD,
            database: MY_SQL_DB_DATABASE,
        });

        console.debug('MySql Adapter Pool generated successfully');
    } catch (error) {
        console.error('[mysql.connector][init][Error]: ', error);
        throw new Error('failed to initialized pool');
    }
};

init();

io.on("connection", (socket) => {
    console.log("connexion :", socket.handshake.headers.host);
    // socket.emit("noArg");
    // socket.emit("basicEmit", 1, "2", Buffer.from([3]));
    // socket.emit("withAck", "4", (e) => {
    //     // e is inferred as number
    // });

    // works when broadcast to all
    // io.emit("noArg");

    // works when broadcasting to a room
    // io.to("room1").emit("basicEmit", 1, "2", Buffer.from([3]));
});


io.on("connection", (socket) => {
    socket.on("hello", () => {
        console.log("1 : hello received from client");
        io.emit("basicEmit", 1, "2", Buffer.from([3]));
    });

    socket.on("basicEmit", (a, b, c) => {
        switch (b) {
            case 'list_room':
                console.log('list_room from client')
                break;

            default:
                break;
        }
    })
});
