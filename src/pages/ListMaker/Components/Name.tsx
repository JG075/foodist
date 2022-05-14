import { SxProps } from "@mui/material"
import { produce } from "immer"

import Recipe from "../../../models/Recipe"
import RecipeName from "../../../components/RecipeName"

interface NameProps {
    recipe: Recipe
    onChange?: (recipe: Recipe) => void
    allowEdit?: boolean
    sx?: SxProps
}

const Name = ({ recipe, onChange, allowEdit = false, sx }: NameProps) => {
    const handleListNameChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (!onChange) {
            return
        }
        const newList = produce(recipe, (draft) => {
            draft.name = e.target.value
        })
        onChange(newList)
    }

    const value = allowEdit ? recipe.name : recipe.displayName

    return (
        <RecipeName sx={{ width: "100%", ...sx }} value={value} onChange={handleListNameChange} disabled={!allowEdit} />
    )
}

export default Name
