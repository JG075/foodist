import { useState } from "react"
import PropTypes from "prop-types"

function IngrediantAdder(props) {
    const [inputValue, setInputValue] = useState("")

    const handleOnChange = (e) => setInputValue(e.target.value)
    const handleOnSubmit = (e) => {
        e.preventDefault()
        props.onSubmit(inputValue)
    }

    return (
        <div>
            <form onSubmit={handleOnSubmit}>
                <input
                    placeholder="Enter an ingrediant and quantity e.g. 2 lemons, cheese 500g"
                    value={inputValue}
                    onChange={handleOnChange}
                />
                <button>Enter</button>
            </form>
        </div>
    )
}

IngrediantAdder.propsTypes = {
    onSubmit: PropTypes.func,
}

export default IngrediantAdder
