import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const tokenize = (exp: string) => {
    const regex = /(\(|\)|\*|\+|\d+)/g;
    let match;
    const tokens = [];
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = regex.exec(exp)) !== null) {
        tokens.push(match[1]);
    }
    tokens.push(null);
    return tokens;
};
class Tokens {
    private _tokens: string[];
    private _index = 0;
    constructor(tokens: string[]) {
        this._tokens = tokens;
    }
    public get current(): string {
        return this._tokens[this._index];
    }
    public next() {
        this._index++;
    }
}
const evaluate = (tokens: Tokens, until: string): number => {
    const simpleList: Array<number | string> = [];
    while (tokens.current !== until) {
        if (tokens.current === "(") {
            tokens.next();
            const exprResult = evaluate(tokens, ")");
            simpleList.push(exprResult);
        } else if (tokens.current === "+" || tokens.current === "*") {
            simpleList.push(tokens.current);
        } else {
            const num = parseInt(tokens.current, 10);
            simpleList.push(num);
        }
        tokens.next();
    }
    for (let index = 0; index < simpleList.length; index++) {
        const token = simpleList[index];
        if (token === "+") {
            const sum =  Number(simpleList[index - 1]) + Number(simpleList[index + 1]);
            simpleList.splice(index - 1, 3, sum);
            index--;
        }
    }
    return simpleList.filter((e) => e !== "*").map(Number)
        .reduce((a, v) => a * v, 1);
};
class Expression {
    private tokens: Tokens;
    constructor(expr: string) {
        this.tokens = new Tokens(tokenize(expr));
    }

    public value() {
        const result = evaluate(this.tokens, null);
        return result;
    }
}

const rig = new Rig(18, async (d) => {
    const expressions = parseToObjects(d, /.*/, (ss) => new Expression(ss[0]));
    return expressions.reduce((a, v) => a + v.value(), 0);
});
(async (): Promise<void> => {
    await rig.test("1 + (2 * 3) + (4 * (5 + 6))", 51);
    await rig.test("5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))", 669060);
    await rig.runPrint();
})()
    .then(() => { console.log("Done"); });
