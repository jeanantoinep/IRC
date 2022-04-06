import { createPool, Pool } from 'mysql2'


// interface Room {
//     id: number;
//     name: string;
// }


export class DatabaseDriver {
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

    public async getUserByUsername(username: string): Promise<string> {
        return this.query("SELECT * FROM `user` WHERE username='" + username + "'")
            .then((result: any) => {
                return JSON.stringify(result)
            })
            .catch((error: string) => {
                return 'error'
            })
    }

    public async getRooms(): Promise<string> {
        return this.query("SELECT * FROM `room`")
            .then((result: any) => {
                return JSON.stringify(result)
            })
            .catch((error: string) => {
                return 'error'
            })
    }

    public async addRoom(roomName: string): Promise<string | number> {
        return this.query("INSERT INTO `room` (name) VALUES ('" + roomName + "')")
            .then((result: any) => {
                return result['insertId'] as number
            })
            .catch((error: string) => {
                return 'duplicate_entry'
            });
    }
}
