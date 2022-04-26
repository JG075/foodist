import Qty from "js-quantities"
import { fraction as mfraction, round } from "mathjs"

export const perferedAliases = [
    ["cu", "cup"],
    ["tb", "tbsp"],
]

export const fractionalUnits = ["", "tb", "tsp", "cu"]

export const commonCookingFractions = ["1/8", "1/4", "1/3", "1/2", "2/3", "3/4"]

Qty.formatter = (scalar, units) => {
    const [, preferedAlias] = perferedAliases.find(([alias, prefered]) => alias === units) || []

    let outputUnit = preferedAlias || units
    let outputScalar = scalar

    // Output 1/4 instead of 0.25 for some units
    if (fractionalUnits.includes(units)) {
        const fraction = mfraction(scalar)
        const fractionStr = fraction.toFraction()
        outputScalar = commonCookingFractions.includes(fractionStr) ? fractionStr : round(scalar, 2)
    } else {
        outputScalar = round(scalar, 2)
    }

    return outputUnit ? `${outputScalar} ${outputUnit}` : `${outputScalar}`
}

export default Qty
