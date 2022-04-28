/** @jsxImportSource @emotion/react */
import { createRef } from "react"
import PropTypes from "prop-types"
import List from "@mui/material/List"
import { Button, TextField } from "@mui/material"
import { CSSTransition, TransitionGroup } from "react-transition-group"

import ModelIngrediant from "../models/Ingrediant"
import IngrediantItem from "./IngrediantItem"
import theme from "../theme"

const IngrediantList = ({
    list,
    onItemDelete,
    onItemCheck,
    allowEdit,
    onCheckAll,
    onUncheckAll,
    makeForQty,
    onMakeForChange,
}) => {
    const ingrediantItems = list.map((item, i) => {
        const itemRef = createRef(null)
        return (
            <CSSTransition key={item.id} timeout={500} classNames="ingrediantList-item" nodeRef={itemRef}>
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

IngrediantList.propTypes = {
    list: PropTypes.arrayOf(PropTypes.instanceOf(ModelIngrediant)),
    onItemDelete: PropTypes.func,
    onItemCheck: PropTypes.func,
    allowEdit: PropTypes.bool,
    onCheckAll: PropTypes.func,
    onUncheckAll: PropTypes.func,
    onMakeForChange: PropTypes.func,
    makeForQty: PropTypes.number,
}

export default IngrediantList
