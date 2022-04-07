// import { ClientMessageHandler } from './connections/clientMessageHandler';
import { Core } from "./core"
// import { DatabaseDriver } from './databasedriver';


async function main() {
    let core = new Core();
}

main();

//     const io = core.getIo();
//     const dbDriver = new DatabaseDriver();
//     // const clientMsg = new ClientMessageHandler(io, dbDriver);
//     const ascii_art: string = `________/\\\_______        __/\\\________/\\\_        _____/\\\\\\\\\____        __/\\\\\\\\\\\\____        
//  _____/\\\\/\\\\____        _\/\\\_______\/\\\_        ___/\\\\\\\\\\\\\__        _\/\\\////////\\\__       
//   ___/\\\//\////\\\__        _\/\\\_______\/\\\_        __/\\\/////////\\\_        _\/\\\______\//\\\_      
//    __/\\\______\//\\\_        _\/\\\_______\/\\\_        _\/\\\_______\/\\\_        _\/\\\_______\/\\\_     
//     _\//\\\______/\\\__        _\/\\\_______\/\\\_        _\/\\\\\\\\\\\\\\\_        _\/\\\_______\/\\\_    
//      __\///\\\\/\\\\/___        _\/\\\_______\/\\\_        _\/\\\/////////\\\_        _\/\\\_______\/\\\_   
//       ____\////\\\//_____        _\//\\\______/\\\__        _\/\\\_______\/\\\_        _\/\\\_______/\\\__  
//        _______\///\\\\\\__        __\///\\\\\\\\\/___        _\/\\\_______\/\\\_        _\/\\\\\\\\\\\\/___ 
//         _________\//////___        ____\/////////_____        _\///________\///__        _\////////////_____`

//     io.on("connection", (socket) => {
//         console.log("connection from :", socket.id)

//         // works when broadcast to all
//         // io.emit("noArg");

//         // works when broadcasting to a room
//         // io.to("r oom1").emit("basicEmit", 1, "2", Buffer.from([3]));
//     });

//     io.on("test", (socket) => {
//         socket.on("listRoom", () => {
//             console.log("list_room from client ON test");
//         })
//     })

//     io.on("connection", (socket) => {
//         socket.on("ascii", () => {
//             socket.emit("ascii", ascii_art);
//         })

//         socket.on("login", () => {
//             console.log("login received from client");
//         });

//         socket.on("listRoom", () => {
//             console.log("list_room from client")
//             let result = dbDriver.getRooms()
//             console.log(result)
//             // if (result[0] == '0') {
//             //     io.emit("listRoom", JSON.stringify({"answer":"Error while trying to list rooms"}))
//             //     throw err
//             // }
//             // let resultString = JSON.stringify(result)
//             // io.emit("listRoom", resultString)

//         })

//         socket.on("addRoom", async (roomName: string) => {
//             console.log("addRoom from client");
//             let result = await dbDriver.addRoom(roomName);
//             console.log("retour recvAddRoom");
//             console.log(result);
//             if (result == 'duplicate_entry') {
//                 io.emit("addRoom", JSON.stringify({ "result": "duplicate_entry" })); // emit l'erreur au client
//             } else {
//                 io.emit("addRoom", JSON.stringify({ "result": "success", "roomName": roomName })); // emit succès
//             }
//             // console.log(result)
//             // pool.query("INSERT INTO `room` (name) VALUES (?)", [roomName], function (err, result) {
//             //     if (err) {
//             //         io.emit("addRoom", JSON.stringify({"answer":"Error while trying to add a room"}))
//             //         throw err;
//             //     }
//             //     io.emit("addRoom", JSON.stringify({"answer":"Room added"}))
//             // });
//         })
//     });
// }