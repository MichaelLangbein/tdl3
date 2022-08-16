import { estimate, estimateDistributions, getNodeWithId, Node } from './tdvs';

describe("Top-down variable structure", () => {

    test("basics", () => {

        const nodeTree: Node = {
            id: 0,
            complete: false,
            level: 0,
            time: 100,
            children: [{
                id: 1,
                level: 1,
                time: 75,
                complete: true,
                children: []
            }, {
                id: 2,
                level: 1,
                time: 60,
                complete: false,
                children: [{
                    id: 3,
                    level: 2,
                    time: 10,
                    complete: true,
                    children: []
                }]
            }]
        };

        const node = getNodeWithId(1, nodeTree)!;
        const { timesOnLevels, childrenOnLevels } = estimateDistributions(nodeTree);
        const e = estimate(node, timesOnLevels, childrenOnLevels);

        expect(e).toBeTruthy();
    });

});