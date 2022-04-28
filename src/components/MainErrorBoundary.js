/** @jsxImportSource @emotion/react */
import React from "react"

import ErrorMsg from "./ErrorMsg"

class MainErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { error: false }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.log(error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return <ErrorMsg css={{ marginTop: "20px" }}>Sorry, something went wrong.</ErrorMsg>
        }
        return this.props.children
    }
}

export default MainErrorBoundary
