class List {
    private _values: number[][] = [[0]];

    constructor(private Limit: number) {}
    private Half = this.Limit / 2;
    private _length: number = 1;

    private partPos = (fullPos: number) => {
        let count = 0;
        for (let index = 0; index < this._values.length; index++) {
            const segSize = this._values[index].length;
            if (count + segSize > fullPos) {
                return {seg: index, i: fullPos - count};
            }
            count += segSize;
        }
        return {seg: this._values.length - 1, i: this._values[this._values.length - 1].length};
    }
    private split = (seg: number) => {
        this._values.splice(seg + 1, 0, []);
        const l = this._values[seg].length;
        const toMove = this._values[seg].splice(this.Half, l - this.Half);
        this._values[seg + 1] = toMove;
    }

    insertAt(value: number, pos: number) {
        const pos2 = this.partPos(pos);
        this._values[pos2.seg].splice(pos2.i, 0, value);
        if (this._values[pos2.seg].length > this.Limit) {
            this.split(pos2.seg);
        }
        this._length++;
    }
    removeAt(pos: number): number {
        const pos2 = this.partPos(pos);
        const v = this._values[pos2.seg].splice(pos2.i, 1)[0];
        this._length--;
        return v;
    }
    get length() {
        return this._length;
    }
}
export {List};