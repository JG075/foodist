import { SxProps } from "@mui/material"
import { produce } from "immer"

import IngrediantList from "../../../models/IngrediantList"
import IngrediantListName from "../../../components/IngrediantListName"

interface NameProps {
    ingrediantList: IngrediantList
    onChange?: (ingrediantList: IngrediantList) => void
    allowEdit?: boolean
    sx?: SxProps
}

const Name = ({ ingrediantList, onChange, allowEdit = false, sx }: NameProps) => {
    const handleListNameChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (!onChange) {
            return
        }
        const newList = produce(ingrediantList, (draft) => {
            draft.name = e.target.value
        })
        onChange(newList)
    }

    const value = allowEdit ? ingrediantList.name : ingrediantList.displayName

    return (
        <IngrediantListName
            sx={{ width: "100%", ...sx }}
            value={value}
            onChange={handleListNameChange}
            disabled={!allowEdit}
        />
    )
}

export default Name
