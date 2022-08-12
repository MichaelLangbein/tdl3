import { Db } from '../db/db';



export interface Task {
    id: number,
    description: string,
}

export class TaskService {
    // @TODO: use prepared statements

    constructor(private db: Db) {}

    public async init() {
        const tables = await this.db.read(`
            select name from sqlite_master where type='table' and name='tasks'
        `);
        if (tables.length === 0) {
            console.log('Initializing db schema ...')
            await this.db.write(`
                create table tasks (
                    id          integer primary key autoincrement,
                    description text    not null
                );
            `);
        }
    }
    
    public async getTask(id: number) {
        const results = await this.db.read(`
            select * from tasks where id = ${id};
        `);
        console.log(results)
        return results[0];
    }

    public async createTask(description: string) {
        await this.db.write(`
            insert into tasks (description)
            values ("${description}");
        `);
    }

}