import { Database } from 'sqlite';

export interface TaskTree {
    id: number,
    title: string,
    description: string,
    parent: TaskTree | null,
    children: TaskTree[]
}


export class TaskService {
    // @TODO: use prepared statements

    constructor(private db: Database) {}

    public async init() {
        const tasksTable = await this.db.get(`
            select name from sqlite_master where type='table' and name='tasks'
        `);
        if (!tasksTable) {
            await this.db.exec(`
                create table tasks (
                    id          integer primary key autoincrement,
                    title       text    not null,
                    description text,
                    parent      integer
                );
            `);
        }
    }
    
    public async getTask(taskId: number) {
        const result = await this.db.get(`
            select * from tasks where id = $id;
        `, { 
            '$id': taskId 
        });
        return result;
    }

    public async getChildIds(taskId: number) {
        const results = await this.db.all(`
            select id from tasks where parent = $parent;    
        `, {
            '$parent': taskId
        });
        return results.map(v => v.id);
    }

    public async getSubtree(id: number, level: number = 0) {
        const root = await this.getTask(id);
        root.children = [];
        if (level > 0) {
            const childIds = await this.getChildIds(id);
            for (const childId of childIds) {
                const childTree = await this.getSubtree(childId, level - 1); // @TODO: do in parallel?
                childTree.parent = root;
                root.children.push(childTree);
            }
        }
        return root;
    }

    public async getLastInsertId() {
        const result = await this.db.get(`SELECT last_insert_rowid()`);
        return result['last_insert_rowid()'];
    }

    public async createTask(title: string, description: string, parentId: number | null) {
        if (parentId) {
            await this.db.run(`
                insert into tasks (title, description, parent)
                values ($title, $description, $parent);
            `, {
                "$title": title,
                "$description": description,
                "$parent": parentId
            });
        } else {
            await this.db.run(`
                insert into tasks (title, description)
                values ($title, $description);
            `, {
                "$title": title,
                "$description": description
            });
        }
        const id = await this.getLastInsertId();
        const task = await this.getTask(id);
        return task;
    }
    
    public async updateTask(id: number, title: string, description: string, parentId: number) {
        await this.db.run(`
            update tasks
            set title = $title,
                description = $description,
                parent = $parent
            where id = $id
        `, {
            '$id': id,
            '$title': title,
            '$description': description,
            '$parent': parentId
        });
        const updatedTask = this.getTask(id);
        return updatedTask;
    }

    public async deleteTask(taskId: number) {
        await this.db.run(`
            delete from tasks
            where id = $id;
        `, {
            '$id': taskId
        });
    }

    public async deleteTree(taskId: number, recursive=true) {
        if (recursive) {
            const childIds = await this.getChildIds(taskId);
            for (const childId of childIds) {
                await this.deleteTree(childId, recursive);
            }
        }
        this.deleteTask(taskId);
    }

}