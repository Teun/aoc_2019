import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

class Node {
    private _center: Node;
    public get center(): Node {
        return this._center;
    }
    public set center(v: Node) {
        this._center = v;
    }

    public get depth(): number {
        return this.center ? this.center.depth + 1 : 0;
    }
    constructor(public name: string) {
    }
}

const rig = new Rig(6
    ,
    async (d) => {
        const values = parseToObjects(d, /(\w+)\)(\w+)/, (s, n) => {
            return s.slice(1, 3);
        });
        const com = new Node("COM");
        const allNodes = values.reduce((a: { [name: string]: Node }, p) => {
            const [name1, name2] = p;
            const center = a[name1] || new Node(name1);
            const orbiter = a[name2] || new Node(name2);
            a[name1] = center;
            a[name2] = orbiter;
            orbiter.center = center;
            return a;
        }, { });
        return Object.values(allNodes)
            .reduce((a, v) => a + v.depth, 0);
    }
);
(async () => {
    await rig.test(`COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L`, 42);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
