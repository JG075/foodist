import React, { ReactElement } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import Signup from "./pages/Signup"
import Signin from "./pages/Signin"
import Recipe from "./pages/Recipe"
import Lists from "./pages/Lists"
import { ProvideAuth } from "./hooks/auth"
import { useAuth } from "./hooks/auth"

const container = document.getElementById("root")
const root = createRoot(container as Element)

/* To enable at a future date */
// const PrivateRoute = ({ children, ...rest }) => {
//     let auth = useAuth()
//     return (
//         <Route
//             {...rest}
//             render={({ location }) =>
//                 auth.user ? (
//                     children
//                 ) : (
//                     <Navigate
//                         to={{
//                             pathname: "/login",
//                             state: { from: location },
//                         }}
//                     />
//                 )
//             }
//         />
//     )
// }

const PublicRoute = ({ children, ...rest }: { children: ReactElement }) => {
    let auth = useAuth()
    return auth.user ? (
        <Navigate
            to={{
                pathname: "/",
            }}
        />
    ) : (
        children
    )
}

const IndexPage = () => {
    const { user } = useAuth()
    return user ? <Lists user={user} /> : <Recipe useLocalView />
}

const Index = () => {
    return (
        <ProvideAuth>
            <Router basename={process.env.PUBLIC_URL}>
                <React.StrictMode>
                    <Routes>
                        <Route path="/" element={<App />}>
                            <Route index element={<IndexPage />} />
                            <Route
                                path="/signup"
                                element={
                                    <PublicRoute>
                                        <Signup />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/signin"
                                element={
                                    <PublicRoute>
                                        <Signin />
                                    </PublicRoute>
                                }
                            />
                            <Route path="/users/:username">
                                <Route path="/users/:username/recipes" element={<Lists />} />
                                <Route path="/users/:username/recipes/:id" element={<Recipe />} />
                            </Route>
                        </Route>
                    </Routes>
                </React.StrictMode>
            </Router>
        </ProvideAuth>
    )
}

root.render(<Index />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
