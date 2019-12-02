export class IntCodeMachine {
    constructor(private memory: number[]) {
        
    }
    private _pointer: number = 0;
    public get Memory() : number[] {
        return this.memory;
    }
    /**
     * Run
     */
    public Run() {
        while(this.Step()){
            // do nothing
        }
        
    }
    private Step(): boolean {
        const result = this.ExecOp();
        if(result) { this._pointer += 4;}
        return result;
    }
    private ExecOp() {
        switch (this.memory[this._pointer]) {
            case 1:
                const sum = this.memory[this.memory[this._pointer + 1]] + this.memory[this.memory[this._pointer + 2]];
                this.memory[this.memory[this._pointer + 3]] = sum;
                return true;
            case 2:
                const prod = this.memory[this.memory[this._pointer + 1]] * this.memory[this.memory[this._pointer + 2]];
                this.memory[this.memory[this._pointer + 3]] = prod;
                return true;
            case 99: 
                return false;
            default:
                throw "Unexpected op";
        }

    }
}