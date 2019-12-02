import { IntCodeMachine } from "./IntCodeMachine";

it("Calculates sums", () => {
    const machine = new IntCodeMachine([1, 0, 0, 0, 99]);
    machine.Run();

    expect(machine.Memory).toEqual([2, 0, 0, 0, 99]);
});
it("Calculates products", () => {
    const machine = new IntCodeMachine([2, 4, 4, 5, 99, 0]);
    machine.Run();

    expect(machine.Memory).toEqual([2, 4, 4, 5, 99, 9801]);
});
it("Handles overwritten operations", () => {
    const machine = new IntCodeMachine([1, 1, 1, 4, 99, 5, 6, 0, 99]);
    machine.Run();

    expect(machine.Memory).toEqual([30, 1, 1, 4, 2, 5, 6, 0, 99]);
});
