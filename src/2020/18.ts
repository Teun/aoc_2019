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
    let acc = 0;
    for (let index = 0; index < simpleList.length; index++) {
        const token = simpleList[index];
        if (token === "*") {
            index++;
            acc *= Number(simpleList[index]);
        } else if (token === "+") {
            index++;
            acc += Number(simpleList[index]);
        } else {
            acc = Number(token);
        }
    }
    return acc;
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
    await rig.test("2 * 3 + (4 * 5)", 26);
    await rig.test("5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))", 12240);
    await rig.runPrint();
})()
    .then(() => { console.log("Done"); });
