import { ColorDef, createImage } from "pngjs-image";
import { Grid } from "./grid";
import { whileStatement } from "@babel/types";

const black: ColorDef = {red: 0, green: 0, blue: 0, alpha: 255};
const white: ColorDef = {red: 255, green: 255, blue: 255, alpha: 255};
const colors = {black, white};

function plotGrid<T>(grid: Grid<T>, out: string, colorMap?: (v: T) => ColorDef) {
    const color = colorMap || ((v) => v ? black : white);

    const boundaries = grid.boundaries();
    const ox = boundaries[0].x;
    const oy = boundaries[0].y;

    const img = createImage(boundaries[1].x - ox + 1, boundaries[1].y - oy + 1);
    for (const gridpos of grid.positions()) {
        img.setAt(gridpos.pos.x + ox, gridpos.pos.y + oy, color(gridpos.val));
    }
    return new Promise((res, rej) => {
        img.writeImage(out, (err) => {
            if (err) {
                rej(err);
            } else {
                res(true);
            }
        });

    });
};
export { plotGrid, colors };
