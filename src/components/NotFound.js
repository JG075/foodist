/** @jsxImportSource @emotion/react */
import React from "react"
import { Link } from "react-router-dom"
import Title from "./Title"

const NotFound = () => (
    <div>
        <Title>Not Found!</Title>
        <p>Sorry we couldn't find what you were looking for.</p>
        <Link to="/">Go Home</Link>
    </div>
)

export default NotFound
