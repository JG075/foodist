/** @jsxImportSource @emotion/react */
import React, { ReactNode } from "react"

import ErrorMsg from "./ErrorMsg"
import MainContainer from "./MainContainer"

interface AppErrorBoundaryState {
    hasError: boolean
}

interface AppErrorBoundaryProps {
    children: ReactNode
}

class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
    constructor(props: AppErrorBoundaryProps) {
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
            return (
                <MainContainer>
                    <ErrorMsg>Sorry, something went wrong.</ErrorMsg>
                </MainContainer>
            )
        }
        return this.props.children
    }
}

export default AppErrorBoundary
