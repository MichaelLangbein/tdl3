import { TaskTree } from '../model/taskService';
import { estimateTime as tdvs } from './tdvs';



export function estimateTime(taskId: number, tree: TaskTree) {
    const e = tdvs(taskId, tree);
    return {
        'tdvs': e
    };
}