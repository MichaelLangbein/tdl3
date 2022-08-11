import { Db } from "./db";
import { fileExists, removeFile } from "../files/files";


const dbPath = "./tdl.db";

test("create database", async () => {
    const db = new Db(dbPath);
    expect(db).toBeTruthy();

    await db.init();
    const fileCreated = await fileExists("./tdl.db");
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
    console.log(content)

});


afterAll(async () => {
    removeFile(dbPath);
});