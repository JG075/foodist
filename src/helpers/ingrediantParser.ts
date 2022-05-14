import { number, fraction as mfraction } from "mathjs"

import { toTitleCase } from "./string"
import Qty from "../lib/qty"

// RegExplanation

// Digit first ("50g Apples"):
// ^\s*(?:(?<qty>(?:\d[/.]?)+)(?<measure>[^\d\s]*))?\s*(?<name>.*)
// Any digit, optionally followed by . or /, this pattern as much as possible
// The measue which is any character except a digit or space
// Any number of spaces, optional
// Any character after is considered the name
// Note: If it is wrote as 50g apples, this will be parsed as 50<qty> g<measure> apples<name>
// If it is wrote as 50 g apples, this will be parsed as 50<qty> g apples<name>
// The name is then later checked to see if it contains a valid unit at the start
// It's not neeeded in the next case as the measure/unit comes after the qty: "Apples 50 g",
// and so can't be confused as part of the name

// Name first ("Apples 50g"):
// ^\s*(?<name>.*)\s(?<!\([^)]*)(?<qty>(?:\d[/.]?)+)\s*(?<measure>[^\d\s]*)
// Any space before is acceptable
// Any character, as many as possible
// Any digit, optionally followed by . or /, this pattern as much as possible
// Unless it is after "(" which is not followed by ")" is this part > (?<!\([^)]*)
// Any number of spaces, optional
// Lastly the measue which is any character except a digit or space

const ingrediantParser = (textString: string) => {
    const hasNumberFirst = /^\s*(\d[/.]?)+/i.test(textString)
    const regEx = hasNumberFirst
        ? /^\s*(?:(?<qty>(?:\d[/.]?)+)(?<measure>[^\d\s]*))?\s*(?<name>.*)/i
        : /^\s*(?<name>.*)\s(?<!\([^)]*)(?<qty>(?:\d[/.]?)+)\s*(?<measure>[^\d\s]*)/i
    let match = textString.toLowerCase().match(regEx)
    if (!match) {
        // Try to match a string that doesn't start with a digit
        const fallBack = /^\s*(?<name>[^\s\d].*)/i
        match = textString.toLowerCase().match(fallBack)
    }
    if (!match || !match.groups) {
        throw new Error("No valid match")
    }
    const { groups } = match
    const { name, qty, measure } = groups
    if (!name) {
        throw new Error("No ingrediant name")
    }
    const quantity = qty || "1"
    const measurement = measure || ""
    let parsedQty = null
    let parsedName = name
    try {
        let parsedMeasurement = measurement
        const isEscaped = /^".*"$/.test(name)
        // Try to get the measurement from the name e.g. "grams cheese"
        // Except if the name is escaped e.g. "\"Grams Cookies\""
        if (!isEscaped && !measurement && hasNumberFirst) {
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
        parsedQty = Qty(`${normalizedQty} ${parsedMeasurement}`)
    } catch (error) {
        throw error
    }
    return {
        name: toTitleCase(parsedName),
        qty: parsedQty,
    }
}

export default ingrediantParser
