/** @jsxImportSource @emotion/react */
import { ReactNode } from "react"

interface TitleProps {
    children: ReactNode
}

const Title = (props: TitleProps) => {
    return (
        <h1
            css={{
                marginTop: "0",
                fontSize: "26px",
                marginBottom: "30px",
                fontWeight: 500,
            }}
        >
            {props.children}
        </h1>
    )
}

export default Title
