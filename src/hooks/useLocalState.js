import { useEffect } from "react"
import { useImmer } from "./useImmer"

const useLocalState = (defaultValue, key, serializer, deserializer) => {
    const [value, setValue] = useImmer(() => {
        const localValue = window.localStorage.getItem(key)
        if (localValue === null) {
            return defaultValue
        }
        const parsedValue = JSON.parse(localValue)
        return deserializer ? deserializer(parsedValue) : parsedValue
    })

    useEffect(() => {
        const serializedValue = serializer ? serializer(value) : value
        window.localStorage.setItem(key, JSON.stringify(serializedValue))
    }, [key, value])

    return [value, setValue]
}

export default useLocalState
