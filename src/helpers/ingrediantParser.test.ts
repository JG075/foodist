import ingrediantParser from "./ingrediantParser"
import Qty, { perferedAliases, fractionalUnits } from "../lib/qty"

test.each([
    ["Limes", { name: "Limes", qty: new Qty("1") }],
    ["Limes 2", { name: "Limes", qty: new Qty("2") }],
    ["2 Limes", { name: "Limes", qty: new Qty("2") }],
    ["Cheese 350g", { name: "Cheese", qty: new Qty("350g") }],
    ["Cheese 350 g", { name: "Cheese", qty: new Qty("350g") }],
    ["Cheese 350 grams", { name: "Cheese", qty: new Qty("350g") }],
    ["350g Cheese", { name: "Cheese", qty: new Qty("350g") }],
    ["350 g Cheese", { name: "Cheese", qty: new Qty("350g") }],
    ["350 grams Cheese", { name: "Cheese", qty: new Qty("350g") }],
    ["Grams Cheese 350", { name: "Grams Cheese", qty: new Qty("350") }],
    ["500ml Orange Juice", { name: "Orange Juice", qty: new Qty("500ml") }],
    ["500 ml Orange Juice", { name: "Orange Juice", qty: new Qty("500ml") }],
    ["500 milliliters Orange Juice", { name: "Orange Juice", qty: new Qty("500ml") }],
    ["Orange Juice 500ml", { name: "Orange Juice", qty: new Qty("500ml") }],
    ["Orange Juice 500 ml", { name: "Orange Juice", qty: new Qty("500ml") }],
    ["Orange Juice 500 milliliters", { name: "Orange Juice", qty: new Qty("500ml") }],
    ["50 grams Flour (Use 14% Protein Flour)", { name: "Flour (Use 14% Protein Flour)", qty: new Qty("50 grams") }],
    ["Flour (Use 14% Protein Flour) 50 grams ", { name: "Flour (Use 14% Protein Flour)", qty: new Qty("50 grams") }],
])("ingrediantParser('%s')", (input, expected) => {
    const output = ingrediantParser(input)
    expect(output.name).toEqual(expected.name)
    expect(output.qty.format()).toEqual(expected.qty.format())
})

test("Ingrediant name can be escaped for edge cases", () => {
    const output1 = ingrediantParser('3 "Grams Pie"')
    expect(output1.name).toEqual("Grams Pie")
    expect(output1.qty.format()).toEqual("3")

    const output2 = ingrediantParser('100g "Grams Cookies"')
    expect(output2.name).toEqual("Grams Cookies")
    expect(output2.qty.format()).toEqual("100 g")
})

test("Throws errors if the input is invalid", () => {
    expect(() => {
        ingrediantParser("20foo apples")
    }).toThrow()
    expect(() => {
        ingrediantParser("20")
    }).toThrow()
    expect(() => {
        ingrediantParser("")
    }).toThrow()
})

const fractionalUnitHelper = (
    scalar: string,
    unit: string,
    ingrediant: string,
    reverse: boolean,
    outputTemplate: string
) => {
    const inputString = reverse ? `${ingrediant} ${scalar}${unit}` : `${scalar}${unit} ${ingrediant}`
    const output = ingrediantParser(inputString)
    expect(output.name).toEqual(ingrediant)
    const [, preferedAlias] = perferedAliases.find(([alias, prefered]) => alias === unit) || ["", unit]
    const expectedOutput = outputTemplate.replace("%s", scalar).replace("%u", preferedAlias).trim()
    expect(output.qty.format()).toEqual(expectedOutput)
}

test.each(fractionalUnits)("ingrediantParser('1/4%s Apple')", (unit) => {
    fractionalUnitHelper("1/4", unit, "Apple", false, "%s %u")
})

test.each(fractionalUnits)("ingrediantParser('Apple 1/4%s')", (unit) => {
    fractionalUnitHelper("1/4", unit, "Apple", true, "%s %u")
})

test.each(fractionalUnits)("ingrediantParser('0.5%s Apple')", (unit) => {
    fractionalUnitHelper("0.5", unit, "Apple", false, `1/2 %u`)
})

test.each(fractionalUnits)("ingrediantParser('Apple 0.5%s')", (unit) => {
    fractionalUnitHelper("0.5", unit, "Apple", true, `1/2 %u`)
})

test("Does not use fraction output for non fractional units", () => {
    fractionalUnitHelper("0.5", "g", "Apple", false, `%s %u`)
    fractionalUnitHelper("0.5", "g", "Apple", true, `%s %u`)
})

test("Converts a fraction to decimal for non fractional units", () => {
    fractionalUnitHelper("1/2", "g", "Apple", false, `0.5 %u`)
    fractionalUnitHelper("1/2", "g", "Apple", true, `0.5 %u`)
})

test('Remove the word "of" from the ingrediant name', () => {
    const output = ingrediantParser("100g of rice")
    expect(output.name).toEqual("Rice")
    expect(output.qty.format()).toEqual("100 g")
})

test('Keep the word "of" in the ingrediant name if it\'s escaped', () => {
    const output = ingrediantParser('100g "of rice"')
    expect(output.name).toEqual("Of Rice")
    expect(output.qty.format()).toEqual("100 g")
})
