import logo from "./logo.svg"
import "./App.css"
import UrlBox from "./components/UrlBox"
import IngrediantAdder from "./components/IngrediantAdder"
import IngrediantList from "./components/IngrediantList"

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Foodist</h1>
                <p>The easiest way to make and share ingrediants</p>
            </header>
            <main>
                <UrlBox />
                <IngrediantAdder />
                <IngrediantList />
            </main>
        </div>
    )
}

export default App
