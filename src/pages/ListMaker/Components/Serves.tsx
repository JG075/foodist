import { useImmer } from "use-immer"
import { produce } from "immer"

import IngrediantList from "../../../models/IngrediantList"
import ServesInput from "../../../components/ServesInput"

interface ServesProps {
    ingrediantList: IngrediantList
    onChange?: (ingrediantList: IngrediantList) => void
    allowEdit?: boolean
}

const Serves = ({ ingrediantList, onChange, allowEdit = false }: ServesProps) => {
    const [serves, setServes] = useImmer(ingrediantList.serves.toString())

    const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setServes(e.target.value)
        if (!e.target.value || Number(e.target.value) < 1) {
            return
        }
        const newList = produce(ingrediantList, (draft) => {
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
