import LoadingButton from "@mui/lab/LoadingButton"
import { useNavigate } from "react-router-dom"
import { useImmer } from "use-immer"
import Extras from "./Components/Extras"

import useLocalState from "../../hooks/useLocalState"
import Recipe from "../../models/Recipe"
import Adder from "./Components/Adder"
import List from "./Components/List"
import Name from "./Components/Name"
import Serves from "./Components/Serves"

const LocalView = () => {
    const [recipe, setRecipe] = useLocalState(new Recipe({}), "recipe", Recipe)
    const navigate = useNavigate()
    const [makeForQty, setMakeForQty] = useImmer<number | null>(null)

    const handlePublish = async () => navigate("/signup")

    const handleOnChange = (list: Recipe) => {
        setRecipe(list)
    }

    const handleServesChange = (recipe: Recipe) => {
        setMakeForQty(recipe.serves)
        handleOnChange(recipe)
    }

    const handleMakeForChange = (value: number) => {
        setMakeForQty(value)
    }

    return (
        <>
            <Name recipe={recipe} onChange={handleOnChange} allowEdit />
            <Extras recipe={recipe} onChange={handleOnChange} allowEdit />
            <Serves recipe={recipe} onChange={handleServesChange} allowEdit />
            <LoadingButton
                sx={{
                    margin: "20px auto 0",
                    width: "108px",
                    display: "block",
                }}
                color="secondary"
                variant="contained"
                size="medium"
                onClick={handlePublish}
            >
                Publish
            </LoadingButton>
            <Adder recipe={recipe} onChange={handleOnChange} />
            <List
                recipe={recipe}
                onChange={handleOnChange}
                onMakeForChange={handleMakeForChange}
                makeForQty={makeForQty}
                allowEdit
            />
        </>
    )
}

export default LocalView
