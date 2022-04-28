import "./App.css"
import React from "react"
import { ThemeProvider } from "@mui/material"
import { Outlet, useNavigate } from "react-router-dom"

import theme from "./theme"
import Header from "./components/Header"
import { useAuth } from "./hooks/auth"
import MainErrorBoundary from "./components/MainErrorBoundary"
import MainContainer from "./components/MainContainer"
import AppErrorBoundary from "./components/AppErrorBoundary"

function App() {
    const { user, signout } = useAuth()
    const navigate = useNavigate()

    const handleOnSignOut = async (e) => {
        e.preventDefault()
        await signout()
        navigate("/")
    }

    return (
        <AppErrorBoundary>
            <ThemeProvider theme={theme}>
                <div className="App">
                    <Header user={user} onSignout={handleOnSignOut} />
                    <MainContainer>
                        <MainErrorBoundary>
                            <Outlet />
                        </MainErrorBoundary>
                    </MainContainer>
                </div>
            </ThemeProvider>
        </AppErrorBoundary>
    )
}

export default App
