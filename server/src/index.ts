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

//RELATED TO DATABASE//
///////////////////////
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
//////////////////////

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


interface IRoom {
    uid: number;
    uname: string;
}

io.on("connection", (socket) => {
    socket.on("hello", () => {
        console.log("hello received from client");
        // io.emit("basicEmit", 1, "2", Buffer.from([3]));
    });

    socket.on("basicEmit", (a, b, c) => {
        let args = b.split(' ')
        switch (args[0]) {
            case 'list_room':
                console.log("list_room from client")
                pool.query("SELECT * FROM `room`", function (err, result) {
                    if (err) throw err;
                    let toSend = "";
                    result.forEach((element: { name: string; }) => {
                         toSend += element.name + '\n';
                    });
                    io.emit("basicEmit", 1, toSend, Buffer.from([3]))
                });
                break;
            case 'create_room':
                console.log("create_room from client")
                let roomName = ""
                args.forEach((element, index) => {
                    if (index > 0)
                        roomName += element + ' '
                });
                roomName.slice(0, -1)

                pool.query("INSERT INTO `room` (name) VALUES (?)", [roomName], function (err, result) {
                    if (err) {
                        console.log("Error while trying to add a room")
                        throw err;
                    }
                    console.log("Room added successfuly")
                });
                break;
            default:
                break;
        }
    })
});

// class UserController {
//     // returns all users
//     public async getUsers(): Promise<Array<IRoom>> {
//         const [rows]: [Array<IRoom>] = await pool.query("SELECT * FROM `user`", []);
//         console.log(pool.query("SELECT * FROM `user`"))
//         return rows; // rows is Array<IUser> so it matches the promise type
//     }
// }