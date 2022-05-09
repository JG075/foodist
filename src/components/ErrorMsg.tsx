/** @jsxImportSource @emotion/react */
import { ReactNode } from "react"

import theme from "../theme"

interface ErrorMsgProps {
    children: ReactNode
    className?: string
}

const ErrorMsg = ({ children, className, ...rest }: ErrorMsgProps) => {
    return (
        <span css={{ color: theme.palette.error.main, margin: 0, display: "block" }} className={className} {...rest}>
            {children}
        </span>
    )
}

export default ErrorMsg
