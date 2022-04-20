/** @jsxImportSource @emotion/react */
import PropTypes from "prop-types"

import theme from "../theme"

const ErrorMsg = ({ children, ...rest }) => {
    return (
        <span css={{ color: theme.palette.error.main, margin: 0, display: "block" }} {...rest}>
            {children}
        </span>
    )
}

ErrorMsg.propTypes = {
    children: PropTypes.node,
}

export default ErrorMsg
