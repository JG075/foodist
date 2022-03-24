function IngrediantItem (props) {
    return (
        <li>
            <span>{props.name}</span>
            <span>{props.quantity.value}</span>
            <span>{props.quantity.measurement}</span>
            <button>X</button>
        </li>
    )
}

export default IngrediantItem;