import { Coord, Grid } from "./modules/grid";
import { colors, plotGrid } from "./modules/gridplot";
import { Rig } from "./modules/rig";

const rig = new Rig(8,
    async (d, o, ro: {width: number, height: number, outputFile?: string}) => {
        const digits = d.trim().split("");
        const width = ro.width;
        const height = ro.height;
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
        if (ro.outputFile) {
            await plotGrid(g, `./output/${ro.outputFile}.png`,
                (v) => v === "#" ? colors.black : colors.white
                );
        }
        return g.toString();
    }
);
(async () => {
    await rig.test("0222112222120000", "# \n #\n", {width: 2, height: 2});
    await rig.runPrint({width: 25, height: 6, outputFile: "8a"});
})().then(() => {console.log("Done"); });
