import {firstBy as by} from "thenby";
import { Coord, Grid } from "./modules/grid";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const rig = new Rig(8,
    async (d, o) => {
        const digits = d.trim().split("");
        let width = 25;
        let height = 6;
        if (o.type === "test") {
            width = 2;
            height = 2;
        }
        const layerSize = (width * height);
        const numLayers = digits.length / layerSize;
        const layers = ([...Array(numLayers).keys()]).map((v, i) => {
            return digits.slice(i * layerSize, (i + 1) * layerSize);
        });
        const g = new Grid<string>();
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const pixelStack = layers.map((l) => l[x + y * width]);
                const pixel = pixelStack
                    .reverse()
                    .reduce((a, v) => {
                    if (v === "2") {return a; }
                    if (v === "1") {return " "; }
                    if (v === "0") {return "#"; }
                }, ".");
                g.set(new Coord(x, y), pixel);
            }
        }
        return g.toString();

    }
);
(async () => {
    await rig.test("0222112222120000", "# \n #\n");
    await rig.runPrint();
})().then(() => {console.log("Done"); });
