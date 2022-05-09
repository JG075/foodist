/** @jsxImportSource @emotion/react */
import { ReactNode } from "react"

import { sectionStyle, mq } from "../sharedStyles"

interface MainContainerProps {
    children: ReactNode
}

const MainContainer = (props: MainContainerProps) => (
    <main
        css={{
            ...sectionStyle,
            textAlign: "center",
            margin: "0 auto",
            padding: "20px",
            boxShadow: "5px 10px 0px 3px #8e484a",
            marginTop: 20,
            [mq[0]]: {
                padding: "40px 40px 40px",
            },
        }}
    >
        {props.children}
    </main>
)

export default MainContainer
