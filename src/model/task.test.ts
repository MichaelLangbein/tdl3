import { createDatabase } from '../db/db';
import { Database } from 'sqlite';
import { TaskService } from './taskService';



let db: Database;
beforeAll(async () => {
    db = await createDatabase(':memory:');
});

afterAll(async () => {
    db.close();
});

test("Task service", async () => {
    const ts = new TaskService(db);
    expect(ts).toBeTruthy();
    await ts.init();

    const task = await ts.createTask("some task");
    expect(task).toBeTruthy();
    const taskFetched = await ts.getTask(task.id);
    expect(taskFetched).toBeTruthy();
    expect(taskFetched.description).toBe("some task");
    console.log(task)

    const childTask = await ts.createTask("some child task", task.id);
    console.log(childTask)
    expect(childTask).toBeTruthy();
    expect(childTask.parent).toBe(task.id);
});



