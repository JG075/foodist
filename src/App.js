import "./App.css"
import UrlBox from "./components/UrlBox"
import IngrediantAdder from "./components/IngrediantAdder"
import IngrediantList from "./components/IngrediantList"

function App() {
    const handleOnSubmit = (inputValue) => {
        console.log(inputValue)

        // TODO: show an error message if above cannot be accomplished
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Foodist</h1>
                <p>The easiest way to make and share ingrediants</p>
            </header>
            <main>
                <UrlBox />
                <IngrediantAdder onSubmit={handleOnSubmit} />
                <IngrediantList />
            </main>
        </div>
    )
}

export default App
