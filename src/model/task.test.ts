import { createDatabase } from '../db/db';
import { Database } from 'sqlite';
import { TaskService } from './taskService';



let db: Database;
let ts: TaskService;
beforeAll(async () => {
    db = await createDatabase(':memory:');
    ts = new TaskService(db);
    await ts.init();
});

afterAll(async () => {
    db.close();
});


describe("Task service", () => {

    test("create", async () => {
        const task = await ts.createTask("some task", "", null);
        expect(task).toBeTruthy();
        const taskFetched = await ts.getTask(task.id);
        expect(taskFetched).toBeTruthy();
        if (taskFetched) {
            expect(taskFetched.title).toBe("some task");
        }
    
        const childTask = await ts.createTask("some child task", "", task.id);
        expect(childTask).toBeTruthy();
        expect(childTask.parent).toBe(task.id);
    });


    test("read", async () => {
        const task = await ts.createTask("some task", "", null);
        const child = await ts.createTask("child task", "", task.id);
        const child2 = await ts.createTask("another task", "", task.id);
        const grandChild = await ts.createTask("grandchild", "", child.id);

        const tree = await ts.getSubtree(task.id, 1);
        expect(tree.children[0].title).toBe("child task");
        expect(tree.children[1].title).toBe("another task");
        expect(tree.children[0].children.length).toBe(0);
        
        const biggerTree = await ts.getSubtree(task.id, 2);
        expect(biggerTree.children[0].children.length).toBe(1);

        const subTree = await ts.getSubtree(child.id, 1);
        expect(subTree.id).toBe(child.id);
        expect(subTree.children[0].id).toBe(grandChild.id);
    });


    test("update", async () => {
        const task = await ts.createTask("some task", "", null);
        task.description = "new description";
        const updatedTask = await ts.updateTask(task.id, task.title, task.description, task.parent, task.secondsActive);

        expect(updatedTask.description).toBe("new description");
    });


    test("delete", async () => {
        const task = await ts.createTask("base task", "", null);
        const child1 = await ts.createTask("child1", "", task.id);
        const child2 = await ts.createTask("child2", "", task.id);
        const grandChild = await ts.createTask("grandChild", "", child1.id);
        await ts.deleteTree(child1.id);
        
        const tree = await ts.getSubtree(task.id, 2);
        expect(tree.children.length).toBe(1);
        expect(tree.children[0].id).toBe(child2.id);

    });


    test("attachments", async () => {
        const task = await ts.createTask("base task", "", null);
        await ts.addFileAttachment(task.id, "/some/file/path.txt");
        const tree = await ts.getSubtree(task.id);
        expect(tree.attachments[0].path).toBe("/some/file/path.txt");
    });

});



