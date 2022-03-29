import Qty from "js-quantities"
import { number, fraction as mfraction } from "mathjs"

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

const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
}

const ingrediantParser = (textString) => {
    const regEx =
        /((?<qty1>[\d/.]+)(?<measure1>[^\d\s]*))?\s*(?<name>(?:\s*[^\d\s])+)(\s+(?<qty2>[\d/.]+))?\s*(?<measure2>[^\d\s]*)/i
    const match = textString.toLowerCase().match(regEx)
    if (!match || !match.groups) {
        throw new Error("No valid match")
    }
    const { groups } = match
    const { name, qty1, qty2, measure1, measure2 } = groups
    if (!name) {
        throw new Error("No ingrediant name")
    }
    const quantity = qty1 || qty2 || "1"
    const measurement = measure1 || measure2 || ""
    let qty = null
    let parsedName = name
    try {
        let parsedMeasurement = measurement
        const isEscaped = /^".*"$/.test(name)
        // Try to get the measurement from the name e.g. "grams cheese"
        // Except if the name is escaped e.g. "\"Grams Cookies\""
        if (!isEscaped && !measurement) {
            const parts = name.split(" ")
            if (parts.length >= 2) {
                try {
                    const firstPartQty = Qty(parts[0])
                    if (firstPartQty.units()) {
                        parsedMeasurement = firstPartQty.units()
                        parsedName = parts.slice(1).join(" ")
                    }
                } catch (error) {
                    // Perhaps send this to a logging service
                }
            }
        }
        if (isEscaped) {
            parsedName = name.replaceAll('"', "")
        }
        const isFraction = /\//.test(quantity)
        let normalizedQty = quantity
        if (isFraction) {
            const fraction = mfraction(quantity)
            normalizedQty = number(fraction)
        }
        qty = Qty(`${normalizedQty} ${parsedMeasurement}`)
    } catch (error) {
        throw error
    }
    return {
        name: toTitleCase(parsedName),
        qty,
    }
}

export default ingrediantParser
