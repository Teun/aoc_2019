import * as rig from "./modules/rig";
import { parseToObjects } from "./modules/lineParser";

const massToFuel = (mass: number) => {
    return Math.floor(mass / 3) - 2;
}
rig.read("1").then(
    async (d) => {
        const values = parseToObjects(d, /.*/, (s, n) => {
            return Number(s[0]);
        });
        const result = values.reduce((a,v)=>a+massToFuel(v), 0);
        console.log(result);
    }
)
