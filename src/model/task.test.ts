import { Db } from '../db/db';
import { deleteFile } from '../files/files';
import { TaskService } from './taskService';


const dbPath = "./tmp/tdl.db";

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
    const task = await ts.getTask(1);
    expect(task).toBeTruthy();
    expect(task.description).toBe("some task");

    await db.close();
});


afterAll(async () => {
    await deleteFile(dbPath);
});