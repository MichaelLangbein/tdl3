import { Db } from "./db/db";
import { fileExists } from "./files/files";


test("create database", async () => {
    const db = new Db("./");
    expect(db).toBeTruthy();

    await db.init();
    const fileCreated = await fileExists("./tdl.db");
    expect(fileCreated).toBeTruthy();

    await db.write("create table tasks");
});