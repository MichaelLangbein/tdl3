import { TaskTree } from '../model/taskService';
import { Queue } from '../utils/datastructures';
import { estimateMean, ExponentialDistribution } from './stats.utils';



export interface Node {
    id: number | null,
    complete: boolean,
    level: number,
    time: number,
    children: Node[]
}

export type levelTimeDists = {[level: number]: ExponentialDistribution};
export type levelChildDists = {[level: number]: ExponentialDistribution};





export function estimate(node: Node, timesOnLevels: levelTimeDists, childrenOnLevels: levelChildDists): number {
    if (node.complete) return fullTime(node);

    // if we're outside the range of available data ...
    const maxLevel = Math.max(...Object.keys(timesOnLevels).map(k => +k));
    if (node.level > maxLevel) {
        // ... return best estimate from last level that does have data
        return timesOnLevels[maxLevel].conditionalExpectation(node.children.length);
    }

    // time required for task itself
    const distTimeSelf = timesOnLevels[node.level];
    const expectedTimeSelf = distTimeSelf.conditionalExpectation(node.time);

    // time required for already existing children
    let expectedTimeChildren = 0;
    for (const child of node.children) {
        expectedTimeChildren += estimate(child, timesOnLevels, childrenOnLevels);
    }

    // time required for potential new children
    const distChildren = childrenOnLevels[node.level];
    const expectedNrChildren = distChildren.conditionalExpectation(node.children.length);
    const fakeChild = {id: null, complete: false, level: node.level + 1, time: 0, children: []};
    const expectedTimeNewChild = estimate(fakeChild, timesOnLevels, childrenOnLevels);
    const expectedTimeExpectedChildren = expectedNrChildren * expectedTimeNewChild;

    // returning sum of the above
    return expectedTimeSelf + expectedTimeChildren + expectedTimeExpectedChildren;
}







export function parseTree(tree: TaskTree, level: number) {
    const node: Node = {id: tree.id, complete: tree.completed ? true : false, level: level, time: tree.secondsActive, children: []};

    for (const child of tree.children) {
        node.children.push(parseTree(child, level + 1));
    }

    return node;
}



export function readParas(node: Node) {
    const timesOnLevelRaw: {[level: number]: number[]} = {};
    const childrenOnLevelRaw: {[level: number]: number[]} = {};

    let current = node;
    const queue = new Queue<Node>(1000);

    while (current) {
        current.children.map(c => queue.enqueue(c));

        if (current.complete) {
            if (!timesOnLevelRaw[current.level]) timesOnLevelRaw[current.level] = [];
            timesOnLevelRaw[current.level].push(current.time);
            if (!childrenOnLevelRaw[current.level]) childrenOnLevelRaw[current.level] = [];
            childrenOnLevelRaw[current.level].push(current.time);
        }

        current = queue.dequeue()!;
    }

    return { timesOnLevelRaw, childrenOnLevelRaw }; 
}

export function estimateDistributions(node: Node) {
    const { timesOnLevelRaw, childrenOnLevelRaw } = readParas(node);

    const timesOnLevels: {[level: number]: ExponentialDistribution} = {};
    const childrenOnLevels: {[level: number]: ExponentialDistribution} = {};

    const maxLevel = Math.max(... Object.keys(timesOnLevelRaw).map(v => +v));
    const allTimes = Object.values(timesOnLevelRaw).reduce((carry, current) => carry.concat(current), []);
    const allChildren = Object.values(childrenOnLevelRaw).reduce((carry, current) => carry.concat(current), []);

    for (let level = 0; level <= maxLevel; level++) {
        let rawTimes = timesOnLevelRaw[level];
        let rawChildren = childrenOnLevelRaw[level];
        // if no data found, use global means
        if (!rawTimes) rawTimes = allTimes;
        if (!rawChildren) rawChildren = allChildren;

        timesOnLevels[level] = new ExponentialDistribution();
        timesOnLevels[level].estimateParas(rawTimes);
        childrenOnLevels[level] = new ExponentialDistribution();
        childrenOnLevels[level].estimateParas(rawChildren);
    }

    return {timesOnLevels, childrenOnLevels};
}


export function fullTime(node: Node) {
    let time = node.time;
    for (const child of node.children) {
        time += fullTime(child);
    }
    return time;
}

export function getNodeWithId(id: number, tree: Node): Node | undefined {
    if (tree.id === id) return tree;
    for (const child of tree.children) {
        const node = getNodeWithId(id, child);
        if (node) return node;
    }
    return undefined;
}


export function estimateTime(taskId: number, tree: TaskTree) {
    const nodeTree = parseTree(tree, 0)!;
    const { timesOnLevels, childrenOnLevels } = estimateDistributions(nodeTree);
    const node = getNodeWithId(taskId, nodeTree)!;
    const e = estimate(node, timesOnLevels, childrenOnLevels);
    return e;
}