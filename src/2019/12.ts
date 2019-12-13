import { combination } from "js-combinatorics";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

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

const rig = new Rig(12,
    async (d, o, ro: number) => {
        const moons = parseToObjects(d, /<x=([0-9-]+), y=([0-9-]+), z=([0-9-]+)>/, (s, n) => {
            return new Moon(new Vector(Number(s[1]), Number(s[2]), Number(s[3])));
        });
        for (let tick = 0; tick < ro; tick++) {
            evaluate(moons);
        }
        return moons.reduce((a, m) => a + m.potentialEnergy * m.kineticEnergy, 0);
    }
);
(async () => {
    await rig.testFromFile("1", 179, 10);
    await rig.runPrint(1000);
})().then(() => {console.log("Done"); });
