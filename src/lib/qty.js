import Qty from "js-quantities"
import { fraction as mfraction } from "mathjs"

export const perferedAliases = [
    ["cu", "cup"],
    ["tb", "tbsp"],
]

export const fractionalUnits = ["", "tb", "tsp", "cu"]

Qty.formatter = (scalar, units) => {
    const [, preferedAlias] = perferedAliases.find(([alias, prefered]) => alias === units) || []
    let parsedScalar
    if (fractionalUnits.indexOf(units) !== -1) {
        const fraction = mfraction(scalar)
        parsedScalar = fraction.toFraction()
    }
    if (parsedScalar || preferedAlias) {
        const firstPart = `${parsedScalar || scalar}`
        const secondPart = `${preferedAlias || units}`
        return secondPart ? `${firstPart} ${secondPart}` : firstPart
    }
    return Qty(`${scalar} ${units}`).toString()
}

export default Qty
