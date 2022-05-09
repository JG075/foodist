/** @jsxImportSource @emotion/react */
import { ReactNode } from "react"

import theme from "../../../theme"

export interface ListItemsProps {
    lists: ReactNode | null
    emptyMsg: string
}

const ListItems = ({ lists, emptyMsg }: ListItemsProps) => {
    return (
        <>{lists ? lists : <div css={{ fontSize: "1.125rem", color: theme.palette.primary.main }}>{emptyMsg}</div>}</>
    )
}

export default ListItems
