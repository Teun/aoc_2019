import * as assert from "assert";
import {exists, readFile } from "fs";
import * as isEqual from "is-equal";
import * as why from "is-equal/why";
import { promisify } from "util";

type RunType = "run" | "test";
export interface RunContext {
    type: RunType;
}

export class Rig<T> {
    constructor(private day: number, private func: (d: string, opt: RunContext) => Promise<T>) {}

    public async run() {
        const raw = await this.getContent();
        const result = await this.func(raw, {type: "run"});
        return result;
    }
    public async runPrint() {
        console.log(`Result: ${JSON.stringify(await this.run())}`);
    }
    public async test(raw: string, expected: T) {
        const result = await this.func(raw, {type: "test"});
        if (!isEqual(result, expected)) {
            throw new Error(why(result, expected));
        }
        console.log(`OK: ${JSON.stringify(result)}`);
    }
    public async testPrint(raw) {
        const result = await this.func(raw, {type: "test"});
        console.log(`Result: ${result}`);
    }
    public async testFromFile(snipName, expected) {
        const all = await getFileContent(`${this.day}.snips`);
        const snip: string = extractSnip(snipName, all);
        await this.test(snip, expected);

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
    const startMarker = lines.findIndex((l) => l.startsWith(`snip:${name}`));
    assert(startMarker > -1);
    const endMarker = lines.indexOf("====", startMarker);
    assert(endMarker > startMarker);
    const snip = lines.slice(startMarker + 1, endMarker)
        .join("\n");
    return snip;
};
