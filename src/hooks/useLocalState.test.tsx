import { screen } from "@testing-library/react"

import useLocalState from "./useLocalState"
import setup from "../testHelpers"

const TestComponent = ({
    defaultValue,
    localStorageKey,
    valueToSet,
}: {
    defaultValue: any
    localStorageKey: string
    valueToSet?: any
}) => {
    const [value, setValue] = useLocalState(defaultValue, localStorageKey)

    const handleOnClick = () => setValue(valueToSet)

    return (
        <div>
            <div>{value && value.toString()}</div>
            <button onClick={handleOnClick}>change value</button>
        </div>
    )
}

test("If there is no value for the provided key in the local storage it returns the default value", () => {
    const defaultValue = "default value"
    setup(<TestComponent defaultValue={defaultValue} localStorageKey="test" />)
    expect(screen.getByText(defaultValue)).toBeInTheDocument()
})

test("If the default value provided has a static deserialize method on its parent class, call and return it", async () => {
    const key = "test-key"
    const value = JSON.stringify({ test: "my value" })
    const deserializedValue = "deserialized"
    const mockDeserialize = jest.fn((obj) => deserializedValue)
    class Test {
        static deserialize = mockDeserialize
    }
    const defaultValue = new Test()
    setup(<TestComponent defaultValue={defaultValue} localStorageKey={key} />, { localStorage: { [key]: value } })
    expect(mockDeserialize.mock.calls[0][0]).toMatchObject(JSON.parse(value))
    expect(await screen.findByText(deserializedValue)).toBeInTheDocument()
})

test("If the default value provided has no static deserialize method on its parent class, return the value from local storage", async () => {
    const key = "test-key"
    const value = JSON.stringify("my value")
    class Test {}
    const defaultValue = new Test()
    setup(<TestComponent defaultValue={defaultValue} localStorageKey={key} />, { localStorage: { [key]: value } })
    expect(await screen.findByText(JSON.parse(value))).toBeInTheDocument()
})

test("When the component renders, set the most recent value in the local storage using the provided key", async () => {
    const key = "test-key"
    class Test {}
    const defaultValue = new Test()
    const valueToSet = "x"
    const { user } = setup(<TestComponent defaultValue={defaultValue} localStorageKey={key} valueToSet={valueToSet} />)
    await user.click(screen.getByText("change value"))
    const setItem = window.localStorage.getItem(key)
    expect(setItem).toEqual(JSON.stringify(valueToSet))
    expect(await screen.findByText(valueToSet)).toBeInTheDocument()
})

test("If the value has a serialize method, call it when setting the value in local storage", async () => {
    const key = "test-key"
    const serializeMock = jest.fn(() => "serialized")
    class Test {
        serialize = serializeMock
    }
    const valueToSet = new Test()
    const { user, localStorage } = setup(
        <TestComponent defaultValue="default" localStorageKey={key} valueToSet={valueToSet} />
    )
    await user.click(screen.getByText("change value"))
    expect(serializeMock).toBeCalledTimes(1)
    expect(localStorage).toHaveProperty(key, JSON.stringify("serialized"))
})
