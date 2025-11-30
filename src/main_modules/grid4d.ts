import { createHash } from "crypto";

class Grid4d<T> {
    private _values: {[k: string]: GridPos<T>} = {};
    private get values(): Array<GridPos<T>> {
        return Object.keys(this._values).map((k) => this._values[k]);
    }
    public hash() {
        const longString = Object.keys(this._values).reduce((a, v) => {
            return a + this._values[v].pos.name() + this._values[v].val.toString();
        }, "");
        const sha = createHash("sha1");
        sha.update(longString);
        return sha.digest("hex");
    }

    public parseFromString(inp: string, z: number, w: number, map: {[k: string]: T}) {
        const lines = inp.split("\n");
        this._values = {};
        lines.forEach((l, y) => {
            const chars = l.split("");
            chars.forEach((char, x) => {
                if (char in map) {
                    const mapped = map[char];
                    const newPos = {pos: new Coord(x, y, z, w), val: mapped};
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
    public *positions(val: T = null): IterableIterator<GridPos<T>> {
        for (const p of this.values) {
            if (val === null || p.val === val) {
                yield p;
            }
        }
    }
    public *positionsFunc(val: ((v: T) => boolean)
        ): IterableIterator<GridPos<T>> {
        for (const p of this.values) {
            if (val === null || val(p.val)) {
                yield p;
            }
        }
    }
    public clone() {
        const newGrid = new Grid4d<T>();
        for (const gp of this.positions()) {
            newGrid.add(gp.pos, gp.val);
        }
        return newGrid;
    }
}
interface GridPos<T> {
    pos: Coord;
    val: T;
}
class Coord {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    constructor(x: (number | string), y?: number, z?: number, w?: number) {
        if (typeof x === "string") {
            const parts = x.split("x").map(Number);
            this.x = parts[0]; this.y = parts[1]; this.z = parts[2]; this.w = parts[3];
        } else {
            this.x = x; this.y = y; this.z = z; this.w = w;
        }
    }
    public name() {
        return `${this.x}x${this.y}x${this.z}x${this.w}`;
    }
    public equals(other: Coord) {
        return this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w;
    }
    public neigboursDiag() {
        const result: Coord[] = [];
        for (const dx of [-1, 0, 1]) {
            for (const dy of [-1, 0, 1]) {
                for (const dz of [-1, 0, 1]) {
                    for (const dw of [-1, 0, 1]) {
                        if (!(dx === 0 && dy === 0 && dz === 0 && dw === 0)) {
                            result.push(this.offset(dx, dy, dz, dw));
                        }
                    }
                }
            }
        }
        return result;
    }
    public offset(dx: number, dy: number, dz: number, dw: number) {
        return new Coord(this.x + dx, this.y + dy, this.z + dz, this.w + dw);
    }
}
export {Coord, Grid4d, GridPos};
