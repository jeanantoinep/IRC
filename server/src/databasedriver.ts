import { createPool, Pool } from 'mysql2'


interface RoomsList {
    id: number;
    name: string;
}


export class DatabaseDriver {
    acceptFriend(friendName: string) {
      throw new Error("Method not implemented.");
    }
    private pool: Pool;


    constructor() {
        this.pool = this.initMySQLConnection();
    }

    /**
     * initMySQLConnection
     */
    private initMySQLConnection() {
        try {
            this.pool = createPool({
                host: 'localhost',
                user: 'irc',
                password: 'Password.2022',
                database: 'irc',
            });

            console.debug('MySql Adapter Pool generated successfully');
        } catch (error) {
            console.error('[mysql.connector][init][Error]: ', error);
            throw new Error('failed to initialize pool');
        }
        return this.pool
    }

    private async query(query: string) {
        return new Promise((resolve, reject) => {
            this.pool.query(query, (error, elements) => {
                if (error) return reject(error);
                return resolve(elements);
            });
        });
    }

    public async getRooms(): Promise<RoomsList[]> {
        let res = await this.query("SELECT * FROM `room`") as RoomsList[];
        console.log(res)
        return res;
    }

    // public getRooms() {
    //     let res: RoomsList[] = [];
    //     this.pool.query("SELECT * FROM `room`", function (err, result) {
    //         if (err) {
    //             return {"answer":'0'}
    //         }
    //         res = result as RoomsList[]
    //         console.log(res)

    //     });

    //     return res
    // }

    public async addRoom(roomName: string) {
        // let res = await this.query("INSERT INTO `room` (name) VALUES (?)") as ;
        let res = await this.query("INSERT INTO `room` (name) VALUES ('" + roomName + "')");
        if (res != NaN)
            console.log(res)
        else
            console.log("Oh BELLE l'erreur là")
        return res
    }
}
