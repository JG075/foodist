import { useEffect, useState } from "react"

const useLocalState = (defaultValue, key, hydrationObj) => {
    const parser = (parserType) => {
        return (key, value) => {
            if (hydrationObj && key in hydrationObj) {
                const parser = hydrationObj[key]
                return parser[parserType](value)
            }
            return value
        }
    }

    const [value, setValue] = useState(() => {
        const localValue = window.localStorage.getItem(key)
        return localValue !== null ? JSON.parse(localValue, parser("hydrate")) : defaultValue
    })

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value, parser("dehydrate")))
    }, [key, value])

    return [value, setValue]
}

export default useLocalState
