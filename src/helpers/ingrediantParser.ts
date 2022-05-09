import { number, fraction as mfraction } from "mathjs"

import { toTitleCase } from "./string"
import Qty from "../lib/qty"

const ingrediantParser = (textString: string) => {
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
            parsedName = parsedName.replaceAll('"', "")
        } else {
            // Remove the word "of" at the start of the string
            parsedName = parsedName.replace(/^of\s/i, "")
        }
        const isFraction = /\//.test(quantity)
        let normalizedQty = quantity
        if (isFraction) {
            const fraction = mfraction(quantity)
            normalizedQty = number(fraction).toString()
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
