import IngrediantItem from "./IngrediantItem"

function IngrediantList(props) {
    const data = [
        {
            name: "Onions",
            quantity: {
                value: "2",
                measurement: "",
            },
        },
        {
            name: "Cheese",
            quantity: {
                value: "500",
                measurement: "grams",
            },
        },

        {
            name: "Lemon Juice",
            quantity: {
                value: "30",
                measurement: "ml",
            },
        },
    ]

    const ingrediantItems = data.map((item) => <IngrediantItem {...item} />)

    return (
        <div>
            <ul>{ingrediantItems}</ul>
        </div>
    )
}

export default IngrediantList
