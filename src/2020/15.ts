import { Rig } from "./modules/rig";
class TinyHistory {
    private _first: number;
    private _last: number;
    public push(val: number) {
        this._first = this._last;
        this._last = val;
    }
    public last() {
        return this._last;
    }
}

const getTurn = (start: number[], seek: number) => {
    const seen: {[key: number]: number} = {};
    let turn = 1;
    const history = new TinyHistory();

    while (true) {
        const prev = history.last();
        if (turn <= start.length) {
            history.push(start[turn - 1]);
        } else {
            if (prev in seen) {
                history.push(turn - seen[prev] - 1);
            } else {
                history.push(0);
            }
        }
        if (turn % 100000 === 0) {
            console.log(turn, history.last());
        }
        seen[prev] = turn - 1;
        if (turn === seek) {
            break;
        }
        turn++;
    }
    return history.last();
};

const rig = new Rig(15, async (d) => {
    return getTurn(d.split(",").map(Number), 30000000);
});
(async (): Promise<void> => {
    await rig.test("0,3,6", 175594);
    await rig.testPrint("6,13,1,15,2,0");
})()
.then(() => {console.log("Done"); });
