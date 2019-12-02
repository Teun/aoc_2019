type DoNext = "Exit" | "Next";

export class IntCodeMachine {
    public get Memory(): number[] {
        return this.memory;
    }
    public get arg1(): number {
        return this.Memory[this._pointer + 1];
    }
    public get arg2(): number {
        return this.Memory[this._pointer + 2];
    }
    public get arg3(): number {
        return this.Memory[this._pointer + 3];
    }
    private _pointer: number = 0;
    constructor(private memory: number[]) {

    }

    public Run() {
        while (this.Step()) {
            // do nothing
        }
    }

    private Step(): boolean {
        const result = this.ExecOp();
        if (result === "Next") { this._pointer += 4; }
        return result !== "Exit";
    }

    private ExecOp(): DoNext {
        switch (this.memory[this._pointer]) {
            case 1:
                const sum = this.memory[this.arg1] + this.memory[this.arg2];
                this.memory[this.arg3] = sum;
                return "Next";
            case 2:
                const prod = this.memory[this.arg1] * this.memory[this.arg2];
                this.memory[this.arg3] = prod;
                return "Next";
            case 99:
                return "Exit";
            default:
                throw new Error("Unexpected op");
        }

    }
}
