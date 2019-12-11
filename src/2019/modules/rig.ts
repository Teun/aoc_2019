import * as assert from "assert";
import {exists, readFile } from "fs";
import * as isEqual from "is-equal";
import * as why from "is-equal/why";
import { promisify } from "util";

type RunType = "run" | "test";
export interface RunContext {
    type: RunType;
}

export class Rig<T, OT> {
    constructor(private day: number, private func: (d: string, opt: RunContext, testOpt: OT) => Promise<T>) {}

    public async run(opt?: OT) {
        const raw = await this.getContent();
        const result = await this.func(raw, {type: "run"}, opt);
        return result;
    }
    public async runPrint(opt?: OT) {
        const result = await this.run(opt);
        const out = (typeof(result) === "string") ? result : JSON.stringify(result);
        console.log(`Result: \n${out}`);
    }
    public async test(raw: string, expected: T, opt?: OT) {
        const result = await this.func(raw, {type: "test"}, opt);
        if (!isEqual(result, expected)) {
            throw new Error(why(result, expected));
        }
        const out = (typeof(result) === "string") ? result : JSON.stringify(result);
        console.log(`OK: ${out}`);
    }
    public async testPrint(raw, opt?: OT) {
        const result = await this.func(raw, {type: "test"}, opt);
        console.log(`Result: ${result}`);
    }
    public async testFromFile(snipName, expected: T, opt?: OT) {
        const all = await getFileContent(`${this.day}.snips`);
        const snip: string = extractSnip(snipName, all);
        await this.test(snip, expected, opt);

    }

    private async getContent(): Promise<string> {
        return getFileContent(this.day.toString());
    }

}
const getFileContent = async (name: string) => {
    const fileName = `input/${name}.txt`;
    if (! (await promisify(exists)(fileName))) { return ""; }
    const d = await promisify(readFile)(fileName, "utf8");
    return d;
};

const extractSnip = (name, all: string) => {
    const lines = all.split("\n");
    const startMarker = lines.indexOf(`snip:${name}`);
    assert(startMarker > -1);
    const endMarker = lines.indexOf("====", startMarker);
    assert(endMarker > startMarker);
    const snip = lines.slice(startMarker + 1, endMarker)
        .join("\n");
    return snip;
};
