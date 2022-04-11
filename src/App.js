/** @jsxImportSource @emotion/react */
import "./App.css"
import React from "react"
import { ThemeProvider } from "@mui/material"
import { Outlet } from "react-router-dom"

import theme from "./theme"
import Header from "./components/Header"
import { sectionStyle } from "./sharedStyles"

function App() {
    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <Header />
                <main
                    css={{
                        ...sectionStyle,
                        textAlign: "center",
                        margin: "0 auto",
                        padding: "20px 40px 40px",
                        boxShadow: "5px 10px 0px 3px #8e484a",
                        marginTop: 20,
                    }}
                >
                    <Outlet />
                </main>
            </div>
        </ThemeProvider>
    )
}

export default App
