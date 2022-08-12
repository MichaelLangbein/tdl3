import { Db } from '../db/db';
import { removeFile } from '../files/files';
import { Task, TaskService } from './taskService';


const dbPath = "./tdl.db";

test("Task service", async () => {
    const db = new Db(dbPath);
    await db.init();
    const ts = new TaskService(db);

    expect(ts).toBeTruthy();

    await ts.init();
    const tables = await db.read(`
            select name from sqlite_master where type='table' and name='tasks'
    `);
    expect(tables.length).toBe(1);

    await ts.createTask("some task");
    const tasks = await ts.getTask(1);
    expect(tasks.length).toBe(1);

    db.close();
});


afterAll(async () => {
    removeFile(dbPath);
});