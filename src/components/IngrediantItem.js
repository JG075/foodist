import PropTypes from "prop-types"
import Qty from "js-quantities"

function IngrediantItem({ name, qty }) {
    return (
        <li>
            <span>{name}</span> <span>{qty.format().replace(/ /g, "")}</span>
            <button>X</button>
        </li>
    )
}

IngrediantItem.propTypes = {
    name: PropTypes.string,
    qty: PropTypes.instanceOf(Qty),
}

export default IngrediantItem
