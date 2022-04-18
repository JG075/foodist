/** @jsxImportSource @emotion/react */
import PropTypes from "prop-types"

import theme from "../theme"

const ErrorMsg = ({ children, ...rest }) => {
    return (
        <div css={{ color: theme.palette.error.main }} {...rest}>
            {children}
        </div>
    )
}

ErrorMsg.propTypes = {
    children: PropTypes.node,
}

export default ErrorMsg
