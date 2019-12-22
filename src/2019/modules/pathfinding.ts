interface IHashcode {
    getHash: () => string;
}
interface IEndOfPath<T> {
    lastState: T;
    prevStateHash: string;

}
class Pathfinder<T extends IHashcode> {
    /**
     * bfs
     */
    public bfs(from: T, expand: (p: T) => T[], done: (T) => boolean): T[] {
        const visited = new Set<string>([from.getHash()]);
        const toExpand = [from];
        const allPaths: { [key: string]: IEndOfPath<T> } = {};
        allPaths[from.getHash()] = {lastState: from, prevStateHash: ""};
        while (true) {
            const ex = toExpand.shift();
            const accNeighbours = expand(ex);
            for (const n of accNeighbours) {
                if (!visited.has(n.getHash())) {
                    visited.add(n.getHash());
                    allPaths[n.getHash()] = { lastState: n, prevStateHash: ex.getHash()};
                    toExpand.push(n);
                }
                if (done(n)) {
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
