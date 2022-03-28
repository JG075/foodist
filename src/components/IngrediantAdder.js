import PropTypes from "prop-types"

function IngrediantAdder({ value, onChange, onSubmit }) {
    return (
        <div>
            <form onSubmit={onSubmit}>
                <input
                    placeholder="Enter an ingrediant and quantity e.g. 2 lemons, cheese 500g"
                    value={value}
                    onChange={onChange}
                />
                <button>Enter</button>
            </form>
        </div>
    )
}

IngrediantAdder.propsTypes = {
    inputValue: PropTypes.string,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
}

export default IngrediantAdder
