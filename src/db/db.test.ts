import { Db } from "./db";
import { fileExists, deleteFile } from "../files/files";


const dbPath = "./tmp/test.db";

test("create database", async () => {
    const db = new Db(dbPath);
    expect(db).toBeTruthy();

    await db.init();
    const fileCreated = await fileExists(dbPath);
    expect(fileCreated).toBeTruthy();

    await db.write(`
        create table tasks (
            id        integer  primary key autoincrement,
            content   text     not null
        );
    `);

    await db.write(`
        insert into tasks (content)
        values 
            ("hello, world!"),
            ("hi, mom!");
    `);

    const content = await db.read(`
        select * from tasks
    `);
    expect(content.length).toBe(2);

    await db.close();
});


afterAll(async () => {
    await deleteFile(dbPath);
});