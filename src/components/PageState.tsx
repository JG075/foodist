/** @jsxImportSource @emotion/react */
import { CircularProgress } from "@mui/material"
import { ReactNode } from "react"

import ErrorMsg from "./ErrorMsg"
import NotFound from "./NotFound"

export enum PageStates {
    ISFETCHING = "ISFETCHING",
    HASERROR = "HASERROR",
    NOTFOUND = "NOTFOUND",
    READY = "READY",
}

interface PageStateProps {
    pageState: PageStates
    children: ReactNode
}

const PageState = ({ pageState, children }: PageStateProps) => {
    switch (pageState) {
        case PageStates.ISFETCHING:
            return <CircularProgress />
        case PageStates.HASERROR:
            const message = "Sorry, something went wrong."
            return <ErrorMsg>{message}</ErrorMsg>
        case PageStates.NOTFOUND:
            return <NotFound />
        case PageStates.READY:
            return <>{children}</>
        default:
            return null
    }
}

export default PageState
