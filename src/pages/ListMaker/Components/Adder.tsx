import { useImmer } from "use-immer"
import { produce } from "immer"

import ingrediantParser from "../../../helpers/ingrediantParser"
import Ingrediant from "../../../models/Ingrediant"
import IngrediantList from "../../../models/IngrediantList"
import IngrediantAdder from "../../../components/IngrediantAdder"

interface AdderProps {
    ingrediantList: IngrediantList
    onChange: (ingrediantList: IngrediantList) => void
}

const Adder = ({ ingrediantList, onChange }: AdderProps) => {
    const [ingrediantInput, setingrediantInput] = useImmer("")
    const [error, setError] = useImmer("")

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => setingrediantInput(e.target.value)

    const handleOnSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        let parsedIngrediant = null
        try {
            parsedIngrediant = ingrediantParser(ingrediantInput)
        } catch (err) {
            if (!(err instanceof Error)) {
                throw err
            }
            if (err.name === "QtyError") {
                setError("You have entered an invalid measurement unit.")
            } else {
                setError("Please enter an ingrediant name and optionally a quantity.")
            }
            return
        }
        const newIngrediant = new Ingrediant(parsedIngrediant)
        const newList = produce(ingrediantList, ({ ingrediants }) => {
            ingrediants.unshift(newIngrediant)
        })
        onChange(newList)
        setingrediantInput("")
        setError("")
    }

    return (
        <IngrediantAdder
            value={ingrediantInput}
            onChange={handleOnChange}
            onSubmit={handleOnSubmit}
            error={!!error}
            helperText={error}
        />
    )
}

export default Adder
