import { number, fraction as mfraction } from "mathjs"

import Qty, { fractionalUnits, perferedAliases, commonCookingFractions } from "./qty"

test.each(perferedAliases)("Qty(2 '%s') outputs prefered alias", (defaultAlias, expected) => {
    const output1 = new Qty(`2 ${expected}`)
    expect(output1.format()).toEqual(`2 ${expected}`)

    const output2 = new Qty(`2 ${defaultAlias}`)
    expect(output2.format()).toEqual(`2 ${expected}`)
})

test("When format() is called, if the scalar is a decimal, it should round to 2 decimal places", () => {
    const qty = new Qty("210.249503 g")
    expect(qty.format()).toEqual("210.25 g")
})

test.each(fractionalUnits)(
    "If the output fraction is not a common size, it should be output as a decimal instead",
    (unit) => {
        const qty = new Qty("0.8" + unit)
        const [, preferedAlias] = perferedAliases.find(([alias, prefered]) => alias === unit) || [null, unit]
        const expectedOutput = `0.8 ${preferedAlias}`.trim()
        expect(qty.format()).toEqual(expectedOutput)
    }
)

test.each(fractionalUnits)("If the output fraction is a common size, it should remain as a fraction", (unit) => {
    commonCookingFractions.forEach((fr) => {
        const fraction = mfraction(fr)
        const decimal = number(fraction)
        const qty = new Qty(decimal + unit)
        const [, preferedAlias] = perferedAliases.find(([alias, prefered]) => alias === unit) || [null, unit]
        const expectedOutput = `${fr} ${preferedAlias}`.trim()
        expect(qty.format()).toEqual(expectedOutput)
    })
})
