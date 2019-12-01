import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const massToFuel = (mass: number) => {
    const fuelForThis = Math.max(0, Math.floor(mass / 3) - 2);
    const fuelForFuel = fuelForThis === 0 ? 0 : massToFuel(fuelForThis);
    return fuelForThis + fuelForFuel;
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
    await rig.test("1969", 966);
    await rig.testFromFile("1", 50346);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
