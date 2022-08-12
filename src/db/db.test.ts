import { createDatabase } from './db';


test("create database", async () => {
    const db = await createDatabase(':memory:');
    expect(db).toBeTruthy();

    await db.run(`
        create table tasks (
            id        integer  primary key autoincrement,
            content   text     not null
        );
    `);

    await db.run(`
        insert into tasks (content)
        values 
            (?),
            (?);
    `, ["hello, world!", "hi, mom!"]);

    const content = await db.all(`
        select * from tasks
    `);
    expect(content.length).toBe(2);

    await db.close();
});

