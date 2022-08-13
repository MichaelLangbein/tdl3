import { Database } from "sqlite";
import { createDatabase } from "../db/db";
import { TaskService } from "../model/taskService";
import { estimateTime } from "./estimates";


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


describe("Estimates", () => {

    test("Basic functionality", async () => {

        const parent = await ts.createTask("parent", "", null);
        const child = await ts.createTask("child", "", parent.id);
        await ts.updateTask(parent.id, parent.title, parent.description, null, 100);
        const tree = await ts.getSubtree(parent.id, 2);

        const estimate = estimateTime(parent.id, tree);
        // expect(estimate).toBeTruthy();
    })

});