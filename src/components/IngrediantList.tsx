/** @jsxImportSource @emotion/react */
import { createRef, Ref } from "react"
import List from "@mui/material/List"
import Button, { ButtonProps } from "@mui/material/Button"
import TextField, { TextFieldProps } from "@mui/material/TextField"
import { CSSTransition, TransitionGroup } from "react-transition-group"

import Ingrediant from "../models/Ingrediant"
import IngrediantItem, { IngrediantItemProps } from "./IngrediantItem"
import theme from "../theme"

const transitionTimeout = process.env.NODE_ENV === "test" ? 0 : 300

export interface IngrediantListProps {
    list: Ingrediant[]
    onItemDelete: (id: string) => void
    onItemCheck: (id: string) => void
    allowEdit: IngrediantItemProps["allowEdit"]
    onCheckAll: ButtonProps["onClick"]
    onUncheckAll: ButtonProps["onClick"]
    onMakeForChange: TextFieldProps["onChange"]
    makeForQty: TextFieldProps["value"]
}

const IngrediantList = ({
    list,
    onItemDelete,
    onItemCheck,
    allowEdit,
    onCheckAll,
    onUncheckAll,
    makeForQty,
    onMakeForChange,
}: IngrediantListProps) => {
    const ingrediantItems = list.map((item, i) => {
        const itemRef: Ref<HTMLLIElement> = createRef()
        return (
            <CSSTransition key={item.id} timeout={transitionTimeout} classNames="ingrediantList-item" nodeRef={itemRef}>
                <IngrediantItem
                    key={item.id}
                    item={item}
                    onDelete={() => onItemDelete(item.id)}
                    onItemCheck={() => onItemCheck(item.id)}
                    allowEdit={allowEdit}
                    ref={itemRef}
                />
            </CSSTransition>
        )
    })

    const checkButtonStyle = {
        textTransform: "none",
        fontWeight: "100",
        textDecoration: "underline",
        "&:hover": {
            textDecoration: "underline",
        },
    }

    return (
        <div>
            <div
                css={{
                    display: "flex",
                    justifyContent: "flex-end",
                    margin: "5px 0",
                }}
            >
                <div
                    css={{
                        marginRight: "auto",
                        display: "flex",
                        alignItems: "center",
                        fontSize: "0.875rem",
                        color: theme.palette.primary.main,
                    }}
                >
                    <label htmlFor="make-for-quantity" css={{ fontWeight: "lighter" }}>
                        Make for
                    </label>
                    <TextField
                        id="make-for-quantity"
                        type="number"
                        sx={{
                            marginLeft: "10px",
                            width: "50px",
                            "input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button":
                                {
                                    opacity: 1,
                                },
                            color: "secondary",
                        }}
                        inputProps={{
                            min: "1",
                            sx: {
                                padding: "0 0 0 10px",
                            },
                        }}
                        size="small"
                        variant="outlined"
                        value={makeForQty}
                        onChange={onMakeForChange}
                    />
                </div>
                <Button onClick={onCheckAll} sx={checkButtonStyle}>
                    Check all
                </Button>
                <Button onClick={onUncheckAll} sx={checkButtonStyle}>
                    Uncheck all
                </Button>
            </div>
            <div css={{ overflow: "hidden" }}>
                <List dense sx={{ width: "100%", bgcolor: "background.paper", position: "relative" }}>
                    <TransitionGroup component={null}>{ingrediantItems}</TransitionGroup>
                </List>
            </div>
        </div>
    )
}

export default IngrediantList
