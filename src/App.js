import "./App.css"
import React from "react"
import UrlBox from "./components/UrlBox"
import IngrediantAdder from "./components/IngrediantAdder"
import IngrediantList from "./components/IngrediantList"
import ingrediantParser from "./helpers/ingrediantParser"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import Snackbar from "@mui/material/Snackbar"
import MuiAlert from "@mui/material/Alert"

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
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

    return (
        <div className="App">
            <header className="App-header">
                <h1>Foodist</h1>
                <p>The easiest way to make and share ingrediant lists</p>
            </header>
            <main>
                {/* <UrlBox /> */}
                <IngrediantAdder
                    value={ingrediantInput}
                    onChange={handleOnChange}
                    onSubmit={handleOnSubmit}
                    error={!!appError}
                    helperText={appError}
                />
                <IngrediantList list={ingrediantsList} onItemDelete={handleOnDelete} />
            </main>
        </div>
    )
}

export default App
