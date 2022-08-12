import { Database } from 'sqlite';

export interface Task {
    id: number,
    description: string,
}

export class TaskService {
    // @TODO: use prepared statements

    constructor(private db: Database) {}

    public async init() {
        const table = await this.db.get(`
            select name from sqlite_master where type='table' and name='tasks'
        `);
        if (!table) {
            await this.db.exec(`
                create table tasks (
                    id          integer primary key autoincrement,
                    description text    not null
                );
            `);
        }
    }
    
    public async getTask(id: number) {
        const result = await this.db.get(`
            select * from tasks where id = ${id};
        `);
        return result;
    }

    public async getLastInsertId() {
        const result = await this.db.get(`SELECT last_insert_rowid()`);
        return result['last_insert_rowid()'];
    }

    public async createTask(description: string) {
        await this.db.exec(`
            insert into tasks (description)
            values ("${description}");
        `);
        const id = await this.getLastInsertId();
        const task = await this.getTask(id);
        return task;
    }

}