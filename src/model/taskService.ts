import { Database } from 'sqlite';

export interface TaskTree {
    id: number,
    title: string,
    description: string,
    parent: TaskTree | null,
    children: TaskTree[]
    created: Date,
    completed: Date | null,
    secondsActive: number,
    attachments: FileRow[]
}

export interface TaskRow {
    id: number,
    title: string,
    description: string,
    parent: number,
    created: Date,
    completed: Date | null,
    secondsActive: number
}

export interface FileRow {
    id: number,
    path: string,
    taskId: number
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
                    id              integer primary key autoincrement,
                    title           text    not null,
                    description     text,
                    parent          integer,
                    created         Date,
                    completed       Date,
                    secondsActive   integer
                );
            `);
        }
        const fileTable = await this.db.get(`
            select name from sqlite_master where type='table' and name='files';
        `);
        if (!fileTable) {
            await this.db.exec(`
                create table files (
                    id      integer primary key autoincrement,
                    taskId  integer not null,
                    path    char(500),
                    foreign key (taskId) references tasks (id)
                )
            `);
        }
    }
    
    public async getTask(taskId: number) {
        const result = await this.db.get<TaskRow>(`
            select * from tasks where id = $id;
        `, { 
            '$id': taskId 
        });
        return result;
    }

    public async getChildIds(taskId: number) {
        const results = await this.db.all<{id: number}[]>(`
            select id from tasks where parent = $parent;    
        `, {
            '$parent': taskId
        });
        return results.map(v => v.id);
    }

    public async getLastInsertId() {
        const result = await this.db.get(`SELECT last_insert_rowid()`);
        return result['last_insert_rowid()'];
    }

    public async createTask(title: string, description: string, parentId: number | null) {
        if (parentId) {
            await this.db.run(`
                insert into tasks (title, description, parent, created, secondsActive)
                values ($title, $description, $parent, $created, $secondsActive);
            `, {
                "$title": title,
                "$description": description,
                "$parent": parentId,
                "$created": new Date(),
                "$secondsActive": 0
            });
        } else {
            await this.db.run(`
                insert into tasks (title, description, created, secondsActive)
                values ($title, $description, $created, $secondsActive);
            `, {
                "$title": title,
                "$description": description,
                "$created": new Date(),
                "$secondsActive": 0
            });
        }
        const id = await this.getLastInsertId();
        const task = await this.getTask(id);
        return task!;
    }
    
    public async updateTask(id: number, title: string, description: string, parentId: number | null, secondsActive: number, completed?: Date) {
        if (completed) {
            await this.db.run(`
            update tasks
            set title = $title,
                description = $description,
                ${parentId ? 'parent = $parent,' : ''}
                secondsActive = $secondsActive,
                completed = $completed
            where id = $id
        `, {
            '$id': id,
            '$title': title,
            '$description': description,
            '$parent': parentId,
            '$secondsActive': secondsActive,
            '$completed': completed
        });
        } else {
            await this.db.run(`
            update tasks
            set title = $title,
                description = $description,
                parent = $parent,
                secondsActive = $secondsActive
            where id = $id
        `, {
            '$id': id,
            '$title': title,
            '$description': description,
            '$parent': parentId,
            '$secondsActive': secondsActive
        });
        }
        const updatedTask = await this.getTask(id);
        return updatedTask!;
    }

    public async deleteTask(taskId: number) {
        await this.db.run(`
            delete from tasks
            where id = $id;
        `, {
            '$id': taskId
        });
    }


    public async getFileAttachments(taskId: number): Promise<FileRow[]> {
        const out = await this.db.all(`
            select * from files
            where taskId = $taskId;
        `, {
            '$taskId': taskId
        });
        return out;
    }

    public async addFileAttachment(taskId: number, path: string) {
        await this.db.run(`
            insert into files (path, taskId)
            values ($path, $taskId);
        `, {
            '$taskId': taskId,
            '$path': path
        });
    }

    public async deleteFileAttachment(attachmentId: number) {
        await this.db.run(`
            delete from files
            where id = $id
        `, {
            '$id': attachmentId
        });
    }


    /*-----------------------------------------------------*
     * Higher level methods
     *-----------------------------------------------------*/

    public async getSubtree(id: number, level: number = 0): Promise<TaskTree> {
        const root: any = await this.getTask(id);
        root.attachments = await this.getFileAttachments(id);
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

    public async deleteTree(taskId: number, recursive=true) {
        if (recursive) {
            const childIds = await this.getChildIds(taskId);
            for (const childId of childIds) {
                await this.deleteTree(childId, recursive);
            }
        }
        this.deleteTask(taskId);
    }

    public addAttachment() {}

}