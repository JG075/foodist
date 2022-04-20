/** @jsxImportSource @emotion/react */
import { CircularProgress } from "@mui/material"
import PropTypes from "prop-types"

import ErrorMsg from "./ErrorMsg"
import NotFound from "./NotFound"

export const PageStates = {
    isFetching: "isFetching",
    hasError: "hasError",
    notFound: "notFound",
    allOk: "allOk",
}

const PageState = ({ addMarginTop, pageState, children }) => {
    let marginTop
    if (addMarginTop) {
        marginTop = 20
    }
    switch (pageState) {
        case PageStates.isFetching:
            return <CircularProgress css={{ marginTop: marginTop }} />
        case PageStates.hasError:
            const message = "Sorry, something went wrong."
            return <ErrorMsg css={{ marginTop: marginTop }}>{message}</ErrorMsg>
        case PageStates.notFound:
            return <NotFound />
        case PageStates.allOk:
            return children
        default:
            return null
    }
}

PageState.propTypes = {
    addMarginTop: PropTypes.bool,
    pageState: PropTypes.oneOf(Object.keys(PageStates).map((k) => PageStates[k])),
    children: PropTypes.node,
}

export default PageState
