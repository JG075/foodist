import ingrediantParser from "./ingrediantParser"
import Qty from "js-quantities"

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
    ["500ml Orange Juice", { name: "Orange Juice", qty: new Qty("500ml") }],
    ["500 ml Orange Juice", { name: "Orange Juice", qty: new Qty("500ml") }],
    ["500 milliliters Orange Juice", { name: "Orange Juice", qty: new Qty("500ml") }],
    ["Orange Juice 500ml", { name: "Orange Juice", qty: new Qty("500ml") }],
    ["Orange Juice 500 ml", { name: "Orange Juice", qty: new Qty("500ml") }],
    ["Orange Juice 500 milliliters", { name: "Orange Juice", qty: new Qty("500ml") }],
])("ingrediantParser('%s')", (input, expected) => {
    const output = ingrediantParser(input)
    expect(output.name).toEqual(expected.name)
    expect(output.qty.toString()).toEqual(expected.qty.toString())
})

test("Handles invalid measurements", () => {
    const output1 = ingrediantParser("100foo apples")
    const output2 = ingrediantParser("apples 100foo")
    expect(output1).toBeNull()
    expect(output2).toBeNull()
})

test("Handles no ingrediant name", () => {
    const output = ingrediantParser("100")
    expect(output).toBeNull()
})
