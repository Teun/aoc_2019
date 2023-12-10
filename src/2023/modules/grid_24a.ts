class Grid<T> {
    private _values: {[k: string]: GridPos<T>} = {};
    private get values(): Array<GridPos<T>> {
        return Object.keys(this._values).map((k) => this._values[k]);
    }

    public parseFromString(inp: string, map: {[k: string]: T}) {
        const lines = inp.split("\n");
        this._values = {};
        lines.forEach((l, y) => {
            const chars = l.split("");
            chars.forEach((char, x) => {
                if (char in map) {
                    const mapped = map[char];
                    const newPos = {pos: new Coord(x, y, 0), val: mapped};
                    this._values[newPos.pos.name()] = newPos;
                }
            });
        });
    }
    public set(c: Coord, v: T) {
        this._values[c.name()] = {pos: c, val: v};
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
}
interface GridPos<T> {
    pos: Coord;
    val: T;
}
class Coord {
    get below() {
        if (this.y === 4) {
            return [new Coord(2, 3, this.level + 1)];
        }
        if (this.y === 1 && this.x === 2) {
            return [
                new Coord(0, 0, this.level - 1),
                new Coord(1, 0, this.level - 1),
                new Coord(2, 0, this.level - 1),
                new Coord(3, 0, this.level - 1),
                new Coord(4, 0, this.level - 1),
            ];
        }
        return [new Coord(this.x, this.y + 1, this.level)];
    }
    get above() {
        if (this.y === 0) {
            return [new Coord(2, 1, this.level + 1)];
        }
        if (this.y === 3 && this.x === 2) {
            return [
                new Coord(0, 4, this.level - 1),
                new Coord(1, 4, this.level - 1),
                new Coord(2, 4, this.level - 1),
                new Coord(3, 4, this.level - 1),
                new Coord(4, 4, this.level - 1),
            ];
        }
        return [new Coord(this.x, this.y - 1, this.level)];
    }
    get left() {
        if (this.x === 0) {
            return [new Coord(1, 2, this.level + 1)];
        }
        if (this.x === 3 && this.y === 2) {
            return [
                new Coord(4, 0, this.level - 1),
                new Coord(4, 1, this.level - 1),
                new Coord(4, 2, this.level - 1),
                new Coord(4, 3, this.level - 1),
                new Coord(4, 4, this.level - 1),
            ];
        }
        return [new Coord(this.x - 1, this.y, this.level)];
    }
    get right() {
        if (this.x === 4) {
            return [new Coord(3, 2, this.level + 1)];
        }
        if (this.x === 1 && this.y === 2) {
            return [
                new Coord(0, 0, this.level - 1),
                new Coord(0, 1, this.level - 1),
                new Coord(0, 2, this.level - 1),
                new Coord(0, 3, this.level - 1),
                new Coord(0, 4, this.level - 1),
            ];
        }
        return [new Coord(this.x + 1, this.y, this.level)];
    }

    constructor(public x: number, public y: number, public level: number) {
    }
    public name() {
        return `${this.level}:${this.x}x${this.y}`;
    }
    public equals(other: Coord) {
        return this.x === other.x && this.y === other.y;
    }
    public neighbours() {
        return [...this.above, ...this.below, ...this.left, ...this.right];
    }
}
enum Direction {North, East, South, West}
export {Coord, Direction, Grid, GridPos};
