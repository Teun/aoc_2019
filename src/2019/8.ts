import {firstBy as by} from "thenby";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const rig = new Rig(8,
    async (d) => {
        const digits = d.trim().split("");
        const width = 25;
        const height = 6;
        const layerSize = (width * height);
        const numLayers = digits.length / layerSize;
        const layers = ([...Array(numLayers).keys()]).map((v, i) => {
            return digits.slice(i * layerSize, (i + 1) * layerSize);
        });
        const stats = layers.map((l) => {
            return l.reduce((a, v) => {
                a[v] = (a[v] || 0) + 1;
                return a;
            }, {});

        });
        const orderedByZeroes = stats.sort(by((s) => s["0"]));

        return orderedByZeroes[0]["1"] * orderedByZeroes[0]["2"];
    }
);
(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });
