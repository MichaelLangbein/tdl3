import { createDatabase } from '../db/db';
import { TaskService } from './taskService';


test("Task service", async () => {
    const db = await createDatabase(':memory:');
    const ts = new TaskService(db);
    expect(ts).toBeTruthy();

    await ts.init();
    const table = await db.get(`
    select name from sqlite_master where type='table' and name='tasks'
    `);
    expect(table).toBeTruthy();

    const task = await ts.createTask("some task");
    expect(task).toBeTruthy();
    const taskFetched = await ts.getTask(task.id);
    expect(taskFetched).toBeTruthy();
    expect(taskFetched.description).toBe("some task");



    await db.close();
});

