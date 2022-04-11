import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Index from "./pages/Index"
import Lists from "./pages/Lists"

const container = document.getElementById("root")
const root = createRoot(container)

root.render(
    <Router>
        <React.StrictMode>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<Index />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/users/:username/lists" element={<Lists />} />
                </Route>
            </Routes>
        </React.StrictMode>
    </Router>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
