/** @jsxImportSource @emotion/react */
import React, { ReactNode } from "react"

import ErrorMsg from "./ErrorMsg"

interface MainErrorBoundaryProps {
    children: ReactNode
}

interface MainErrorBoundaryState {
    hasError: boolean
}

class MainErrorBoundary extends React.Component<MainErrorBoundaryProps, MainErrorBoundaryState> {
    constructor(props: MainErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.log(error, info)
    }

    render() {
        if (this.state.hasError) {
            return <ErrorMsg css={{ marginTop: "20px" }}>Sorry, something went wrong.</ErrorMsg>
        }
        return this.props.children
    }
}

export default MainErrorBoundary
