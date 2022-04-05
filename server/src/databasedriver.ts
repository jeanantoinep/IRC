import { createPool, Pool } from 'mysql'
import { Core } from './core';


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
                user: 'root',
                password: 'admin',
                database: 'irc',
            });

            console.debug('MySql Adapter Pool generated successfully');
        } catch (error) {
            console.error('[mysql.connector][init][Error]: ', error);
            throw new Error('failed to initialize pool');
        }
        return this.pool
    }

    public getRooms() {
        let res: { [s: string]: string } = {};
        this.pool.query("SELECT * FROM `room`", function (err, result) {
            console.log(JSON.stringify(result))
            if (err) {
                return {"answer":'0'}
            }
            res = result
        });
        return res
    }

    public addRoom(roomName: string): Object {
        let res = this.pool.query("INSERT INTO `room` (name) VALUES (?)", [roomName], function (err, result) {
            if (err) {
                return {"answer":'0'}
            }
        });
        return res
    }
}
