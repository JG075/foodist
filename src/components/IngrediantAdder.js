function IngrediantAdder(props) {
    return (
        <div>
            <form onSubmit={(e) => e.preventDefault()}>
                <input placeholder="Enter an ingrediant and quantity e.g. 2 lemons, cheese 500g" />
                <button>Enter</button>
            </form>
        </div>
    )
}

export default IngrediantAdder
