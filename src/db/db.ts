import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import { createDirIfNotExists, getPathTo } from '../files/files';


export class Db {
    
    // @TODO: facilitate prepared statements
    
    private db!: Database;
    
    constructor(private dbPath: string) {}
    
    public async init() {
        const path = getPathTo(this.dbPath);
        await createDirIfNotExists(path);

        const db = await open({
            driver: sqlite3.Database,
            filename: `${this.dbPath}`
        });
        this.db = db;
    }

    public async close() {
        await this.db.close();
    }

    public async write(sql: string) {
        await this.db.exec(sql);
    }

    public async read(sql: string) {
        const results = await this.db.all(sql);
        return results;
    }

}