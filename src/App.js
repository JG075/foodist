/** @jsxImportSource @emotion/react */
import "./App.css"
import React from "react"
import { BrowserRouter as Router, useNavigate } from "react-router-dom"
import { ThemeProvider } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"

import IngrediantAdder from "./components/IngrediantAdder"
import IngrediantList from "./components/IngrediantList"
import IngrediantListName from "./components/IngrediantListName"
import ingrediantParser from "./helpers/ingrediantParser"
import useLocalState from "./hooks/useLocalState"
import { useImmer } from "./hooks/useImmer"
import apiIngrediantList from "./api/IngrediantList"
import ModelIngrediant from "./models/Ingrediant"
import ModelIngrediantList from "./models/IngrediantList"
import theme from "./theme"

const sectionStyle = {
    boxSizing: "border-box",
    width: 680,
    borderRadius: 8,
    background: "#fff",
    border: `3px solid #681111`,
    padding: "15px 0",
}

function App() {
    const [ingrediantsList, setIngrediantsList] = useLocalState(
        new ModelIngrediantList({}),
        "ingrediant-list",
        ModelIngrediantList.serialize,
        ModelIngrediantList.deserialize
    )
    const [ingrediantInput, setingrediantInput] = useImmer("", "ingrediant-input")
    const [appError, setAppError] = useImmer()
    const [isPublishing, setIsPublishing] = useImmer(false)
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
        setIngrediantsList(({ ingrediants }) => {
            ingrediants.unshift(newIngrediant)
        })
        setingrediantInput("")
        setAppError("")
    }

    const handleOnDelete = (idToDelete) => {
        setIngrediantsList(({ ingrediants }) => {
            const index = ingrediants.findIndex(({ id }) => id === idToDelete)
            if (index !== -1) ingrediants.splice(index, 1)
        })
    }

    const handleItemCheck = (idToCheck) => {
        setIngrediantsList(({ ingrediants }) => {
            const itemIndex = ingrediants.findIndex(({ id }) => id === idToCheck)
            const item = ingrediants[itemIndex]
            ingrediants.splice(itemIndex, 1)
            const firstCheckedIndex = ingrediantsList.firstCheckedIndex
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
        setIngrediantsList((draft) => {
            draft.name = e.target.value
        })
    }

    const handlePublish = async (e) => {
        const { id } = await apiIngrediantList.post(ingrediantsList)
        setIsPublishing(true)
        console.log(id)
        navigate(`/${id}`)
    }

    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <header
                    css={{
                        ...sectionStyle,
                        textAlign: "left",
                        margin: "12px auto",
                        boxShadow: "3px 5px 0px 3px #8e484a",
                        marginTop: 20,
                        display: "flex",
                        alignItems: "center",
                        padding: "15px 0",
                    }}
                >
                    <h1
                        css={{
                            margin: 0,
                            fontSize: 26,
                            padding: "0px 20px",
                        }}
                    >
                        Foodist
                    </h1>
                </header>
                <main
                    css={{
                        ...sectionStyle,
                        textAlign: "center",
                        margin: "0 auto",
                        padding: "20px 40px 40px",
                        boxShadow: "5px 10px 0px 3px #8e484a",
                        marginTop: 30,
                    }}
                >
                    <IngrediantListName
                        sx={{ width: "80%" }}
                        value={ingrediantsList.name}
                        onChange={handleListNameChange}
                    />
                    <LoadingButton
                        sx={{
                            backgroundColor: "#4c8e48",
                            margin: "20px auto 0",
                            width: "108px",
                            display: "block",
                        }}
                        variant="contained"
                        size="large"
                        onClick={handlePublish}
                        loading={isPublishing}
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
                        list={ingrediantsList.ingrediants}
                        onItemDelete={handleOnDelete}
                        onItemCheck={handleItemCheck}
                    />
                </main>
            </div>
        </ThemeProvider>
    )
}

export default App
