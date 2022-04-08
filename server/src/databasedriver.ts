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

    public async getRoomMessages(roomName: string): Promise<string> {
        return this.query("SELECT message.id, message.message FROM `message` \
                            JOIN `room` ON message.room_id=room.id \
                            WHERE room.name='" + roomName + "' \
                            ORDER BY message.id")
            .then((result: any) => {
                return JSON.stringify(result)
            })
            .catch((error: string) => {
                console.log(error);
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
        var sender = await this.getUserByUsername(senderName);
        var idSender: string = "";
        var regex = /'/gi;
        // var message: string = "";
        if (sender == "[]") {
            idSender = '1';
        } else {
            idSender = JSON.parse(sender)[0]['id'];
            // message = dataParsed['message'].replace(regex, "\\\'"); // remplacer les ' par des \'
        }
        var message = dataParsed['timestamp'] + " " + senderName + " " + dataParsed['message'].replace(regex, "\\\'");
        var room = await this.getRoomByName(dataParsed['room_name']);

        if (sender == undefined || room == undefined) {
            return 'error'
        }
        return this.query("INSERT INTO `message` (user_id,room_id,message) \
                            VALUES (" + idSender + "," + JSON.parse(room)[0]['id'] + ",\
                            '" + message + "')")
            .then((result: any) => {
                return result['insertId'] as number
            })
            .catch((error: string) => {
                console.log(error);
                return 'error'
            });
    }
}
