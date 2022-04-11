export const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
}

export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}
