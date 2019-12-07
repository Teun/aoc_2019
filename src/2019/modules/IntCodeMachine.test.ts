import { IntCodeMachine } from "./IntCodeMachine";

it("Calculates sums", async () => {
    const machine = new IntCodeMachine([1, 0, 0, 0, 99]);
    await machine.Run();

    expect(machine.Memory).toEqual([2, 0, 0, 0, 99]);
});
it("Calculates products", async () => {
    const machine = new IntCodeMachine([2, 4, 4, 5, 99, 0]);
    await machine.Run();

    expect(machine.Memory).toEqual([2, 4, 4, 5, 99, 9801]);
});
it("Calculates products with argModes", async () => {
    const machine = new IntCodeMachine([102, 4, 4, 5, 99, 0]);
    await machine.Run();

    expect(machine.Memory).toEqual([102, 4, 4, 5, 99, 396]);
});
it("Handles overwritten operations", async () => {
    const machine = new IntCodeMachine([1, 1, 1, 4, 99, 5, 6, 0, 99]);
    await machine.Run();

    expect(machine.Memory).toEqual([30, 1, 1, 4, 2, 5, 6, 0, 99]);
});
