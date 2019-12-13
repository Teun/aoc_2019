import { combination } from "js-combinatorics";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const gcd = (a, b) => {
    if (!b) {
      return a;
    }
    return gcd(b, a % b);
};
const lcm = (...args) => {
    if (!args.length) {
      throw new TypeError("lcm: At least one parameter is required");
    }
    return args.reduce((a, b) => Math.abs(a * b) / gcd(a, b));
};

class Vector {
    constructor(public x: number, public y: number, public z: number) {
    }
}
class Moon {
    constructor(public pos: Vector, public v: Vector = new Vector(0, 0, 0)) {}
    public applyGravity(other: Moon) {
        this.v.x += Math.sign(other.pos.x - this.pos.x);
        this.v.y += Math.sign(other.pos.y - this.pos.y);
        this.v.z += Math.sign(other.pos.z - this.pos.z);
    }
    public applyVelocity() {
        this.pos.x += this.v.x;
        this.pos.y += this.v.y;
        this.pos.z += this.v.z;
    }
    public get potentialEnergy(): number {
        return Math.abs(this.pos.x) + Math.abs(this.pos.y) + Math.abs(this.pos.z);
    }
    public get kineticEnergy(): number {
        return Math.abs(this.v.x) + Math.abs(this.v.y) + Math.abs(this.v.z);
    }
}
const evaluate = (moons: Moon[]) => {
    const combinations = combination(moons, 2).toArray();
    combinations.forEach((cb) => {
        cb[0].applyGravity(cb[1]);
        cb[1].applyGravity(cb[0]);
    });
    moons.forEach((m) => {
        m.applyVelocity();
    });
};
let marks: {[key: string]: number} = {};
let cycles = {x: -1, y: -1, z: -1};
let allCycled = false;
const mark = (dir: "x" | "y" | "z", moons: Moon[], tick: number) => {
    const token = dir + moons.reduce((a, m) => a + `:${m.pos[dir]}:${m.v[dir]}`, "");
    if (marks[token] > -1 && cycles[dir] === -1) {
        cycles[dir] = tick;
        if (cycles.x > -1 && cycles.y > -1 && cycles.z > -1) {
            console.log("all cycles found");
            allCycled = true;
        }
    } else {
        marks[token] = tick;
    }
};
const store = (moons: Moon[], tick: number) => {
    mark("x", moons, tick);
    mark("y", moons, tick);
    mark("z", moons, tick);
};

const rig = new Rig(12,
    async (d, o) => {
        const moons = parseToObjects(d, /<x=([0-9-]+), y=([0-9-]+), z=([0-9-]+)>/, (s, n) => {
            return new Moon(new Vector(Number(s[1]), Number(s[2]), Number(s[3])));
        });
        let tick = 0;
        allCycled = false;
        cycles = {x: -1, y: -1, z: -1};
        marks = {};
        while (true) {
            store(moons, tick);
            if (allCycled) { break; }
            evaluate(moons);
            tick++;
        }
        return lcm(cycles.x, cycles.y, cycles.z);
    }
);
(async () => {
    await rig.testFromFile("1", 2772);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
/*

x:268296 -> 2 3 7 1597
y:193052 -> 2 17 167
z:102356 -> 2 25589

(268296 * 193052 * 102356) / (2*2*2)
*/
