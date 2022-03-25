import IngrediantItem from "./IngrediantItem"

function IngrediantList(props) {
    const data = [
        {
            id: 1,
            name: "Onions",
            quantity: {
                value: "2",
                measurement: "",
            },
        },
        {
            id: 2,
            name: "Cheese",
            quantity: {
                value: "500",
                measurement: "grams",
            },
        },
        {
            id: 3,
            name: "Lemon Juice",
            quantity: {
                value: "30",
                measurement: "ml",
            },
        },
    ]

    const ingrediantItems = data.map((item) => (
        <IngrediantItem key={item.id} {...item} />
    ))

    return (
        <div>
            <ul>{ingrediantItems}</ul>
        </div>
    )
}

export default IngrediantList
