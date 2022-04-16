import { useEffect } from "react"
import { useImmer } from "./useImmer"

const useLocalState = (defaultValue, key) => {
    const [value, setValue] = useImmer(() => {
        const localValue = window.localStorage.getItem(key)
        if (localValue === null) {
            return defaultValue
        }
        const parsedValue = JSON.parse(localValue)
        const instanceClass = defaultValue?.constructor
        return instanceClass?.deserialize ? instanceClass.deserialize(parsedValue) : parsedValue
    })

    useEffect(() => {
        const serializedValue = value?.serialize ? value.serialize() : value
        window.localStorage.setItem(key, JSON.stringify(serializedValue))
    }, [key, value])

    return [value, setValue]
}

export default useLocalState
