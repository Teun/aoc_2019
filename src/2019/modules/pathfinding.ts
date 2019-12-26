import {firstBy as by } from "thenby";

interface IHashcode {
    getHash: () => string;
}
interface IEndOfPath<T> {
    lastState: T;
    cost: number;
    prevStateHash: string;
}
interface IVector<T> {
    state: T;
    cost: number;
}
interface IPathWithCost<T> {
    path: T[];
    cost: number;
}
class PrioQueue<T> {
    private _queue: Array<IEndOfPath<T>> = [];
    public enqueue(v: IEndOfPath<T>) {
        const index = this._queue.findIndex((iep) => iep.cost > v.cost);
        if (index === -1) {
            this._queue.push(v);
        } else {
            this._queue.splice(index, 0, v);
        }
    }
    public dequeue() {
        return this._queue.shift();
    }
    public peek() {
        return this._queue[0];
    }
    public get size() : number {
        return this._queue.length;
    }
}

class Pathfinder<T extends IHashcode> {
    /**
     * bfs - Breadth First Search
     */
    public bfs_all(from: T, expand: (p: T) => T[], isTarget: (T) => boolean): T[][] {
        const visited = new Set<string>([from.getHash()]);
        const toExpand = [from];
        const allPaths: { [key: string]: IEndOfPath<T> } = {};
        const allShortestPaths: T[][] = [];
        allPaths[from.getHash()] = {lastState: from, prevStateHash: "", cost: 0};
        while (toExpand.length > 0) {
            const ex = toExpand.shift();
            const parentPath = allPaths[ex.getHash()];
            const accNeighbours = expand(ex);
            for (const n of accNeighbours) {
                if (!visited.has(n.getHash())) {
                    visited.add(n.getHash());
                    allPaths[n.getHash()] = { lastState: n, prevStateHash: ex.getHash(), cost: parentPath.cost + 1};
                    toExpand.push(n);
                }
                if (isTarget(n)) {
                    allShortestPaths.push(this.reconstructPath(n.getHash(), allPaths));
                }
            }
        }
        return allShortestPaths;
    }
    public bfs_weighted(from: T, expand: (p: T) => Array<IVector<T>>, isTarget: (t: T) => boolean): IPathWithCost<T> {
        const allPaths: { [key: string]: IEndOfPath<T> } = {};
        allPaths[from.getHash()] = {lastState: from, prevStateHash: "", cost: 0};
        const toExpand = new PrioQueue<T>();
        toExpand.enqueue(allPaths[from.getHash()]);

        let bestPath: IEndOfPath<T> = {lastState: null, cost: Infinity, prevStateHash: ""};

        let counter = 0;

        while (true) {
            counter++;
            const ex = toExpand.dequeue();
            const parentPath = allPaths[ex.lastState.getHash()];
            console.time("expand");
            const accNeighbours = expand(ex.lastState);
            if (counter % 100 === 0) {
                console.timeEnd("expand");
                console.log(toExpand.size);
            }
            for (const n of accNeighbours) {
                const thisHash = n.state.getHash();
                if ((!(thisHash in allPaths))
                    || parentPath.cost + n.cost < allPaths[thisHash].cost) {
                    allPaths[n.state.getHash()] = {
                        lastState: n.state,
                        prevStateHash: ex.lastState.getHash(),
                        cost: parentPath.cost + n.cost};
                    toExpand.enqueue(allPaths[n.state.getHash()]);
                }
                if (isTarget(n.state)) {
                    if (allPaths[n.state.getHash()].cost < bestPath.cost) {
                        bestPath = allPaths[n.state.getHash()];
                    }
                }
                if (bestPath.cost <= toExpand.peek().cost) {
                    return {
                        cost: bestPath.cost,
                        path: this.reconstructPath(bestPath.lastState.getHash(), allPaths)
                    };
                }
            }
        }
    }
    private reconstructPath(from: string, allPaths: { [key: string]: IEndOfPath<T> }) {
        const head = allPaths[from];
        if (head.prevStateHash === "") {
            return [head.lastState];
        }
        const rest = this.reconstructPath(head.prevStateHash, allPaths);
        return [...rest, head.lastState];

    }
}
export { Pathfinder };
