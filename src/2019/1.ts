import { parseToObjects } from "./modules/lineParser";
import {Rig} from "./modules/rig";

const massToFuel = (mass: number) => {
    return Math.floor(mass / 3) - 2;
};

const rig = new Rig(1,
    async (d) => {
        const values = parseToObjects(d, /.*/, (s, n) => {
            return Number(s[0]);
        });
        const result = values.reduce((a, v) => a + massToFuel(v), 0);
        return result;
    }
);
(async () => {
    await rig.testFromFile("1", 33583);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
