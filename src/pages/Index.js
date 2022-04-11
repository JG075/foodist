/** @jsxImportSource @emotion/react */
import { useNavigate } from "react-router-dom"
import LoadingButton from "@mui/lab/LoadingButton"

import IngrediantAdder from "../components/IngrediantAdder"
import IngrediantList from "../components/IngrediantList"
import IngrediantListName from "../components/IngrediantListName"
import ingrediantParser from "../helpers/ingrediantParser"
import useLocalState from "../hooks/useLocalState"
import { useImmer } from "../hooks/useImmer"
import ModelIngrediant from "../models/Ingrediant"
import ModelIngrediantList from "../models/IngrediantList"

const Index = () => {
    const [ingrediantList, setIngrediantList] = useLocalState(new ModelIngrediantList({}), "ingrediant-list")
    const [ingrediantInput, setingrediantInput] = useImmer("", "ingrediant-input")
    const [appError, setAppError] = useImmer()
    const navigate = useNavigate()

    const handleOnChange = (e) => setingrediantInput(e.target.value)

    const handleOnSubmit = (e) => {
        e.preventDefault()
        let parsedIngrediant = null
        try {
            parsedIngrediant = ingrediantParser(ingrediantInput)
        } catch (err) {
            if (err.name === "QtyError") {
                setAppError("You have entered an invalid measurement unit.")
            } else {
                setAppError("Please enter an ingrediant name and optionally a quantity.")
            }
            return
        }
        const newIngrediant = new ModelIngrediant(parsedIngrediant)
        setIngrediantList(({ ingrediants }) => {
            ingrediants.unshift(newIngrediant)
        })
        setingrediantInput("")
        setAppError("")
    }

    const handleOnDelete = (idToDelete) => {
        setIngrediantList(({ ingrediants }) => {
            const index = ingrediants.findIndex(({ id }) => id === idToDelete)
            if (index !== -1) ingrediants.splice(index, 1)
        })
    }

    const handleItemCheck = (idToCheck) => {
        setIngrediantList(({ ingrediants }) => {
            const itemIndex = ingrediants.findIndex(({ id }) => id === idToCheck)
            const item = ingrediants[itemIndex]
            ingrediants.splice(itemIndex, 1)
            const firstCheckedIndex = ingrediantList.firstCheckedIndex
            if (item.checked) {
                item.checked = false
                ingrediants.splice(firstCheckedIndex, 0, item)
            } else {
                const insertAtIndex = firstCheckedIndex === -1 ? ingrediants.length : firstCheckedIndex - 1
                item.checked = true
                ingrediants.splice(insertAtIndex, 0, item)
            }
        })
    }

    const handleListNameChange = (e) => {
        setIngrediantList((draft) => {
            draft.name = e.target.value
        })
    }

    const handlePublish = async (e) => {
        navigate("/signup", {
            state: {
                ingrediantList,
            },
        })
    }

    return (
        <>
            <IngrediantListName sx={{ width: "80%" }} value={ingrediantList.name} onChange={handleListNameChange} />
            <LoadingButton
                sx={{
                    margin: "20px auto 0",
                    width: "108px",
                    display: "block",
                }}
                color="secondary"
                variant="contained"
                size="large"
                onClick={handlePublish}
            >
                Publish
            </LoadingButton>
            {/* <UrlBox /> */}
            <IngrediantAdder
                value={ingrediantInput}
                onChange={handleOnChange}
                onSubmit={handleOnSubmit}
                error={!!appError}
                helperText={appError}
            />
            <IngrediantList
                list={ingrediantList.ingrediants}
                onItemDelete={handleOnDelete}
                onItemCheck={handleItemCheck}
            />
        </>
    )
}

export default Index
