/** @jsxImportSource @emotion/react */
import "./App.css"
import React from "react"
import { ThemeProvider } from "@mui/material"
import { Outlet, useNavigate } from "react-router-dom"

import theme from "./theme"
import Header from "./components/Header"
import { sectionStyle, mq } from "./sharedStyles"
import { useAuth } from "./hooks/auth"

function App() {
    const { user, signout } = useAuth()
    const navigate = useNavigate()

    const handleOnSignOut = async (e) => {
        e.preventDefault()
        await signout()
        navigate("/")
    }

    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <Header user={user} onSignout={handleOnSignOut} />
                <main
                    css={{
                        ...sectionStyle,
                        textAlign: "center",
                        margin: "0 auto",
                        padding: "20px",
                        boxShadow: "5px 10px 0px 3px #8e484a",
                        marginTop: 20,
                        [mq[0]]: {
                            padding: "20px 40px 40px",
                        },
                    }}
                >
                    <Outlet />
                </main>
            </div>
        </ThemeProvider>
    )
}

export default App
