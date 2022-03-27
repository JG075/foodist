import "./App.css"
import UrlBox from "./components/UrlBox"
import IngrediantAdder from "./components/IngrediantAdder"
import IngrediantList from "./components/IngrediantList"
import ingrediantParser from "./helpers/ingrediantParser"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"

function App() {
    const [ingrediantsList, setIngrediantsList] = useState([])
    const [ingrediantInput, setingrediantInput] = useState("")

    const handleOnChange = (e) => setingrediantInput(e.target.value)
    const handleOnSubmit = (e) => {
        e.preventDefault()
        const parsedIngrediant = ingrediantParser(ingrediantInput)
        if (!parsedIngrediant) {
            // TODO: show an error message if above cannot be accomplished
            console.log(ingrediantInput, "cannot be parsed")
            return
        }
        const newIngrediant = {
            id: uuidv4(),
            ...parsedIngrediant,
        }
        setIngrediantsList([newIngrediant, ...ingrediantsList])
        setingrediantInput("")
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Foodist</h1>
                <p>The easiest way to make and share ingrediants</p>
            </header>
            <main>
                <UrlBox />
                <IngrediantAdder value={ingrediantInput} onChange={handleOnChange} onSubmit={handleOnSubmit} />
                <IngrediantList list={ingrediantsList} />
            </main>
        </div>
    )
}

export default App
