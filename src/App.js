/** @jsxImportSource @emotion/react */
import "./App.css"
import React from "react"
import UrlBox from "./components/UrlBox"
import IngrediantAdder from "./components/IngrediantAdder"
import IngrediantList from "./components/IngrediantList"
import IngrediantListName from "./components/IngrediantListName"
import ingrediantParser from "./helpers/ingrediantParser"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { createTheme, ThemeProvider } from "@mui/material/styles"

const sectionStyle = {
    boxSizing: "border-box",
    width: 680,
    borderRadius: 8,
    background: "#fff",
    border: `3px solid #681111`,
    padding: "15px 0",
}

const theme = createTheme({
    palette: {
        primary: {
            main: "#6f6f6f",
        },
    },
})

function App() {
    const [ingrediantsList, setIngrediantsList] = useState([])
    const [ingrediantInput, setingrediantInput] = useState("")
    const [appError, setAppError] = useState()

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
        const newIngrediant = {
            id: uuidv4(),
            checked: false,
            ...parsedIngrediant,
        }
        setIngrediantsList([newIngrediant, ...ingrediantsList])
        setingrediantInput("")
        setAppError("")
    }

    const handleOnDelete = (idToDelete) => {
        const newIngrediantList = ingrediantsList.filter(({ id }) => id !== idToDelete)
        setIngrediantsList(newIngrediantList)
    }

    const handleItemCheck = (idToCheck) => {
        const newIngrediantList = ingrediantsList.filter(({ id }) => id !== idToCheck)
        const item = ingrediantsList.find(({ id }) => id === idToCheck)
        if (item.checked) {
            const firstCheckedIndex = ingrediantsList.findIndex(({ checked }) => checked)
            newIngrediantList.splice(firstCheckedIndex, 0, {
                ...item,
                checked: false,
            })
        } else {
            const firstCheckedIndex = ingrediantsList.findIndex(({ checked }) => checked)
            const insertAtIndex = firstCheckedIndex === -1 ? newIngrediantList.length : firstCheckedIndex - 1
            newIngrediantList.splice(insertAtIndex, 0, {
                ...item,
                checked: true,
            })
        }
        setIngrediantsList(newIngrediantList)
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
                    <IngrediantListName />
                    {/* <UrlBox /> */}
                    <IngrediantAdder
                        value={ingrediantInput}
                        onChange={handleOnChange}
                        onSubmit={handleOnSubmit}
                        error={!!appError}
                        helperText={appError}
                    />
                    <IngrediantList
                        list={ingrediantsList}
                        onItemDelete={handleOnDelete}
                        onItemCheck={handleItemCheck}
                    />
                </main>
            </div>
        </ThemeProvider>
    )
}

export default App
