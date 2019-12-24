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
class PrioQueue<T> {
    private _queue: Array<IEndOfPath<T>> = [];
    public enqueue(v: IEndOfPath<T>) {
        const index = this._queue.findIndex((iep) => iep.cost > v.cost);
        if(index === -1) {
            this._queue.push(v);
        } else {
            this._queue.splice(index, 0, v);
        }
    }
    public dequeue() {
        return this._queue.shift();
    }
    public peek(v: IEndOfPath<T>) {
        return this._queue[0];
    }
}

class Pathfinder<T extends IHashcode> {
    /**
     * bfs - Breadth First Search
     */
    public bfs(from: T, expand: (p: T) => T[], done: (T) => boolean): T[] {
        const visited = new Set<string>([from.getHash()]);
        const toExpand = [from];
        const allPaths: { [key: string]: IEndOfPath<T> } = {};
        allPaths[from.getHash()] = {lastState: from, prevStateHash: "", cost: 0};
        while (true) {
            const ex = toExpand.shift();
            const parentPath = allPaths[ex.getHash()];
            const accNeighbours = expand(ex);
            for (const n of accNeighbours) {
                if (!visited.has(n.getHash())) {
                    visited.add(n.getHash());
                    allPaths[n.getHash()] = { lastState: n, prevStateHash: ex.getHash(), cost: parentPath.cost + 1};
                    toExpand.push(n);
                }
                if (done(n)) {
                    return this.reconstructPath(n.getHash(), allPaths);
                }
            }
        }
    }
    public bfs_weighted(from: T, expand: (p: T) => Array<IVector<T>>, isTarget: (T) => boolean): T[] {
        const visited = new Set<string>([from.getHash()]);
        const toExpand = [from];
        const allPaths: { [key: string]: IEndOfPath<T> } = {};
        allPaths[from.getHash()] = {lastState: from, prevStateHash: "", cost: 0};
        while (true) {
            const ex = toExpand.shift();
            const parentPath = allPaths[ex.getHash()];
            const accNeighbours = expand(ex);
            for (const n of accNeighbours) {
                if (!visited.has(n.state.getHash())) {
                    visited.add(n.state.getHash());
                    allPaths[n.state.getHash()] = {
                        lastState: n.state,
                        prevStateHash: ex.getHash(),
                        cost: parentPath.cost + n.cost};
                    toExpand.push(n.state);
                }
                if (isTarget(n)) {
                    return this.reconstructPath(n.getHash(), allPaths);
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
