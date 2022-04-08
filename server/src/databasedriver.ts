import { createPool, escape, Pool } from 'mysql2'


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

    public async getUserByUsername(username: string): Promise<string> {
        return this.query("SELECT * FROM `user` WHERE username='" + username + "'")
            .then((result: any) => {
                return JSON.stringify(result)
            })
            .catch((error: string) => {
                return 'error'
            })
    }

    public async addUser(userData: string): Promise<string | number> {
        var dataParsed = JSON.parse(userData);
        return this.query("INSERT INTO `user` (username,password) VALUES (\
            '" + dataParsed['username'] + "','" + dataParsed['password'] + "')")
            .then((result: any) => {
                return result['insertId'] as number
            })
            .catch((error: string) => {
                return 'error'
            });
    }

    public async getRooms(): Promise<string> {
        return this.query("SELECT * FROM `room` ORDER BY name")
            .then((result: any) => {
                return JSON.stringify(result)
            })
            .catch((error: string) => {
                return 'error'
            })
    }

    public async getRoomByName(roomName: string): Promise<string> {
        return this.query("SELECT * FROM `room` WHERE name='" + roomName + "'")
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

    public async addMsg(data: string, senderName: string): Promise<string | number> {
        var dataParsed = JSON.parse(data);
        console.log(dataParsed);
        var sender = await this.getUserByUsername(senderName);
        var room = await this.getRoomByName(dataParsed['room_name']);
        var regex = /'/gi;
        // remplacer les ' par des \'
        var message: string = dataParsed['message'].replace(regex, "\\\'"); 
        console.log(message);
        if (sender == undefined || room == undefined)
            return 'error'
        return this.query("INSERT INTO `message` (user_id,room_id,message) \
                            VALUES (" + JSON.parse(sender)[0]['id'] + "," + JSON.parse(room)[0]['id'] + ",\
                            '" + message + "')")
            .then((result: any) => {
                return result['insertId'] as number
            })
            .catch((error: string) => {
                return 'error'
            });
    }
}
