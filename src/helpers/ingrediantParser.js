import Qty from "js-quantities"

const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
}

const ingrediantParser = (textString) => {
    const regEx = /((?<qty1>\d+)(?<measure1>[a-z]*))?\s*(?<name>(?:\s*[a-z])+)(\s+(?<qty2>\d+))?\s*(?<measure2>[a-z]*)/i
    const match = textString.toLowerCase().match(regEx)
    if (!match || !match.groups) {
        return null
    }
    const { groups } = match
    const { name, qty1, qty2, measure1, measure2 } = groups
    if (!name) {
        return null
    }
    const quantity = qty1 || qty2 || "1"
    const measurement = measure1 || measure2 || ""
    let qty = null
    let parsedName = name
    try {
        let parsedMeasurement = measurement
        if (!measurement) {
            // Try to get the measurement from the name e.g. "grams cheese"
            const firstPart = name.split(" ")
            if (firstPart.length >= 2) {
                try {
                    const firstPartQty = Qty(firstPart[0])
                    if (firstPartQty.units()) {
                        parsedMeasurement = firstPartQty.units()
                        parsedName = firstPart.slice(1).join(" ")
                    }
                } catch (error) {
                    // Perhaps send this to a logging service
                }
            }
        }
        qty = Qty(`${quantity} ${parsedMeasurement}`)
    } catch (error) {
        return null
    }
    return {
        name: toTitleCase(parsedName),
        qty,
    }
}

export default ingrediantParser
