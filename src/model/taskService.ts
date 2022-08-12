import { Database } from 'sqlite';

export interface Task {
    id: number,
    description: string,
    parent: number | null,
    children: Task[]
}

export class TaskService {
    // @TODO: use prepared statements

    constructor(private db: Database) {}

    public async init() {
        const table = await this.db.get(`
            select name from sqlite_master where type='table' and name='tasks'
        `);
        if (!table) {
            await this.db.exec(`
                create table tasks (
                    id          integer primary key autoincrement,
                    description text    not null,
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
                root.children.push(childTree);
            }
        }
        return root;
    }

    public async getLastInsertId() {
        const result = await this.db.get(`SELECT last_insert_rowid()`);
        return result['last_insert_rowid()'];
    }

    public async createTask(description: string, parentId?: number) {
        if (parentId) {
            await this.db.run(`
                insert into tasks (description, parent)
                values ($description, $parent);
            `, {
                "$description": description,
                "$parent": parentId
            });
        } else {
            await this.db.run(`
                insert into tasks (description)
                values ($description);
            `, {
                "$description": description
            });
        }
        const id = await this.getLastInsertId();
        const task = await this.getTask(id);
        return task;
    }
    
    public async updateTask(task: Task) {
        await this.db.run(`
            update tasks
            set description = $description,
                parent = $parent
            where id = $id
        `, {
            '$id': task.id,
            '$description': task.description,
            '$parent': task.parent
        });
        const updatedTask = this.getTask(task.id);
        return updatedTask;
    }

    public async deleteTree(taskId: number, recursive=true) {

    }

}