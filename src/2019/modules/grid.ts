import { createHash } from "crypto";
import { inflate } from "zlib";

class Grid<T> {
    private _values: {[k: string]: GridPos<T>} = {};
    private get values(): Array<GridPos<T>> {
        return Object.keys(this._values).map((k) => this._values[k]);
    }
    public hash() {
        const longString = Object.keys(this._values).reduce((a, v) => {
            return a + this._values[v].pos.name() + this._values[v].val.toString();
        }, "");
        const sha = createHash("sha");
        sha.update(longString);
        return sha.digest("hex");
    }

    public parseFromStringFunc(inp: string, map: {[k: string]: (() => T)}) {
        const lines = inp.split("\n");
        this._values = {};
        lines.forEach((l, y) => {
            const chars = l.split("");
            chars.forEach((char, x) => {
                if (char in map) {
                    const mapped = map[char];
                    const newPos = {pos: new Coord(x, y), val: mapped()};
                    this._values[newPos.pos.name()] = newPos;
                }
            });
        });
    }
    public parseFromString(inp: string, map: {[k: string]: T}) {
        const lines = inp.split("\n");
        this._values = {};
        lines.forEach((l, y) => {
            const chars = l.split("");
            chars.forEach((char, x) => {
                if (char in map) {
                    const mapped = map[char];
                    const newPos = {pos: new Coord(x, y), val: mapped};
                    this._values[newPos.pos.name()] = newPos;
                }
            });
        });
    }
    public add(c: Coord, v: T) {
        if (!(c.name() in this._values)) {
            this.set(c, v);
        } else {
            throw new Error(`Position ${c.name()} already taken`);
        }
    }
    public clear(c: Coord) {
        delete this._values[c.name()];
    }
    public set(c: Coord, v: T) {
        this._values[c.name()] = {pos: c, val: v};
    }
    public setIfEmpty(c: Coord, v: T) {
        if (!(c.name() in this._values)) {
            this.set(c, v);
        }
    }
    public forCoord(c: Coord) {
        if (c.name() in this._values) {
            return this._values[c.name()].val;
        }
        return null;
    }
    public *positions(val: T= null): IterableIterator<GridPos<T>> {
        for (const p of this.values) {
            if (val === null || p.val === val) {
                yield p;
            }
        }
    }
    public clone() {
        const newGrid = new Grid<T>();
        for (const gp of this.positions()) {
            newGrid.add(gp.pos, gp.val);
        }
        return newGrid;
    }
    public boundaries() {
        const out = this.values.reduce((a, v) => {
            a[0] = Math.min(a[0], v.pos.x);
            a[1] = Math.min(a[1], v.pos.y);
            a[2] = Math.max(a[2], v.pos.x);
            a[3] = Math.max(a[3], v.pos.y);
            return a;
        }, [Infinity, Infinity, -Infinity, -Infinity]);
        return [new Coord(out[0], out[1]), new Coord(out[2], out[3])];
    }
    public clip(boundaries: Coord[]) {
        const allKeys = Object.keys(this._values);
        allKeys.forEach((k) => {
            const c = this._values[k];
            if (c.pos.x < boundaries[0].x ||
                c.pos.x > boundaries[1].x ||
                c.pos.y < boundaries[0].y ||
                c.pos.y > boundaries[1].y) {
                    delete this._values[c.pos.name()];
                }
        });
    }
    public toString(display: (c: Coord, v: T) => string = null) {
        if (!display) { display = (c1, v1) => v1 === null ? " " : v1.toString()[0]; }
        const [leftTop, rightBottom] = this.boundaries();
        let out = "";
        for (let y = leftTop.y; y <= rightBottom.y; y++) {
            for (let x = leftTop.x; x <= rightBottom.x; x++) {
                const thisCoord = new Coord(x, y);
                if (thisCoord.name() in this._values) {
                    const name = thisCoord.name();
                    out += display(this._values[name].pos, this._values[name].val);
                } else {
                    out += display(thisCoord, null) || " ";
                }
            }
            out += "\n";
        }
        return out;
    }
}
interface GridPos<T> {
    pos: Coord;
    val: T;
}
class Coord {
    get below() {
        return new Coord(this.x, this.y + 1);
    }
    get above() {
        return new Coord(this.x, this.y - 1);
    }
    get left() {
        return new Coord(this.x - 1, this.y);
    }
    get right() {
        return new Coord(this.x + 1, this.y);
    }
    public static *forRectangle(fromX: number, toX: number, fromY: number, toY: number) {
        for (let x = fromX; x <= toX; x++) {
            for (let y = fromY; y <= toY; y++) {
                yield new Coord(x, y);
            }
        }
    }
    public x: number;
    public y: number;

    constructor(x: number, y: number) {this.x = x; this.y = y; }
    public name() {
        return `${this.x}x${this.y}`;
    }
    public equals(other: Coord) {
        return this.x === other.x && this.y === other.y;
    }
    public neighbourTo(d: Direction) {
        if (d === Direction.North) {return this.above; }
        if (d === Direction.South) {return this.below; }
        if (d === Direction.East) {return this.right; }
        if (d === Direction.West) {return this.left; }
    }
    public neighbours() {
        return [this.above, this.below, this.left, this.right];
    }
    public neigboursDiag() {
        return [this.above, this.below, this.left, this.right,
            new Coord(this.x - 1, this.y - 1), new Coord(this.x + 1, this.y + 1),
            new Coord(this.x + 1, this.y - 1), new Coord(this.x - 1, this.y + 1)
        ];
    }
    public offset(dx: number, dy: number) {
        return new Coord(this.x + dx, this.y + dy);
    }
    public distance(other: Coord) {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
    }
    public distanceMnhtn(other: Coord) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }
}
enum Direction {North, East, South, West}

export {Coord, Direction, Grid, GridPos};
