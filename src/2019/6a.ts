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

    public ancestors(): Node[] {
        if (!this.center) {return []; }
        return [...this.center.ancestors(), this.center];
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
        const santasAncestry = allNodes.SAN.ancestors().map((n) => n.name);
        const myAncestry = allNodes.YOU.ancestors().map((n) => n.name);
        const stepsUp = myAncestry.reverse().findIndex((n) => santasAncestry.indexOf(n) > -1);
        const stepsDown =
            santasAncestry.reverse().findIndex((n) => myAncestry.indexOf(n) > -1);
        return stepsUp + stepsDown;
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
K)L
K)YOU
I)SAN`, 4);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
