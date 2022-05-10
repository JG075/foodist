import { useEffect } from "react"
import { Updater, useImmer } from "use-immer"

const useLocalState = <T>(defaultValue: T, key: string, model?: any): [T, Updater<T>] => {
    const [value, setValue] = useImmer(() => {
        const localValue = window.localStorage.getItem(key)
        if (typeof localValue !== "string" || localValue === "null") {
            return defaultValue
        }
        const parsedValue = JSON.parse(localValue)
        return model?.deserialize ? model.deserialize(parsedValue) : parsedValue
    })

    useEffect(() => {
        const serializedValue = value?.serialize ? value.serialize() : value
        window.localStorage.setItem(key, JSON.stringify(serializedValue))
    }, [key, value])

    return [value, setValue]
}

export default useLocalState
