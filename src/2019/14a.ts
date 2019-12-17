import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";
const ingredFrom = (src: string) => {
    const ingredientRegex = /(\d+) ([A-Z]+)/g;
    const details = ingredientRegex.exec(src);
    return {name: details[2], amount: Number(details[1])};
};
interface Ingredient {
    name: string;
    amount: number;
}
interface IngredientRule {
    to: Ingredient;
    from: Ingredient[];
}
type Need = {[key: string]: number};
const workBackward = (need: Need, rules: IngredientRule[]) => {
    const ingredientsRequired = Object.keys(need).filter((s) => s !== "ORE" && need[s] > 0);
    if (ingredientsRequired.length === 0) {
        return;
    }
    const producerRule = rules.find((r) => r.to.name === ingredientsRequired[0]);
    const times = Math.ceil(need[ingredientsRequired[0]] / producerRule.to.amount);
    need[ingredientsRequired[0]] -= times * producerRule.to.amount;
    producerRule.from.forEach((ing) => need[ing.name] = (need[ing.name] || 0) + times * ing.amount);
};
const oreNeededFor = (fuel: number, rules: IngredientRule[]) => {
    const need: Need = {FUEL: fuel};
    while (Object.keys(need).findIndex((k) => k !== "ORE" && need[k] > 0) > -1) {
        workBackward(need, rules);
    }
    return need.ORE;
};
const rig = new Rig(14,
    async (d) => {
        const rules = parseToObjects(d, /(.*) => (.*)/, (s, n) => {
            const rule: IngredientRule = {to: null, from: []};
            rule.to = ingredFrom(s[2]);
            rule.from = s[1].split(",").map(ingredFrom);
            return rule;
        });
        const target = 1000000000000;
        const oreForOne = oreNeededFor(1, rules);
        let doable = Math.floor(target / oreForOne);
        let undoable = doable * 2;
        while (undoable - doable > 1) {
            const newTry = doable + Math.ceil((undoable - doable) / 2);
            const needed = oreNeededFor(newTry, rules);
            if (needed > target) {
                undoable = newTry;
            } else {
                doable = newTry;
            }
        }
        return doable;
    }
);
(async () => {
    await rig.testFromFile("2", 82892753);
    await rig.testFromFile("3", 460664);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
