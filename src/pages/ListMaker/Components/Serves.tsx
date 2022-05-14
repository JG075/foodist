import { useImmer } from "use-immer"
import { produce } from "immer"

import Recipe from "../../../models/Recipe"
import ServesInput from "../../../components/ServesInput"

interface ServesProps {
    recipe: Recipe
    onChange?: (recipe: Recipe) => void
    allowEdit?: boolean
}

const Serves = ({ recipe, onChange, allowEdit = false }: ServesProps) => {
    const [serves, setServes] = useImmer(recipe.serves.toString())

    const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setServes(e.target.value)
        if (!e.target.value || Number(e.target.value) < 1) {
            return
        }
        const newList = produce(recipe, (draft) => {
            draft.serves = Number(e.target.value)
        })
        if (onChange) {
            onChange(newList)
        }
    }

    let optionalProps = {}
    if (allowEdit) {
        optionalProps = { onChange: handleOnChange }
    }

    return <ServesInput amount={serves} disabled={!allowEdit} {...optionalProps} />
}

export default Serves
