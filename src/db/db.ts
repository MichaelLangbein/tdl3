import { getPathTo, createDirIfNotExists } from '../files/files';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';


/**
 * @param dbPath: user ':memory:' for in-memory db
 */
export async function createDatabase(dbPath: string) {

    if (dbPath !== ':memory:') {
        const path = getPathTo(dbPath);
        createDirIfNotExists(path);
    }
    
    const db = await open({
        driver: sqlite3.Database,
        filename: dbPath,
    });
    return db;
}
