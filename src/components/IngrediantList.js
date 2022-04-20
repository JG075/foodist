/** @jsxImportSource @emotion/react */
import IngrediantItem from "./IngrediantItem"
import PropTypes from "prop-types"
import List from "@mui/material/List"
import ModelIngrediant from "../models/Ingrediant"
import { Button, TextField } from "@mui/material"
import theme from "../theme"

const IngrediantList = ({ list, onItemDelete, onItemCheck, allowEdit, onCheckAll, onUncheckAll }) => {
    const ingrediantItems = list.map((item) => (
        <IngrediantItem
            key={item.id}
            item={item}
            onDelete={() => onItemDelete(item.id)}
            onItemCheck={() => onItemCheck(item.id)}
            allowEdit={allowEdit}
        />
    ))

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
                    margin: "10px 0",
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
                    <span>Make for</span>
                    <TextField
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
                            maxLength: 3,
                            defaultValue: 1,
                            sx: {
                                padding: "0 0 0 10px",
                            },
                        }}
                        size="small"
                        variant="outlined"
                    />
                </div>
                <Button onClick={onCheckAll} sx={checkButtonStyle}>
                    Check all
                </Button>
                <Button onClick={onUncheckAll} sx={checkButtonStyle}>
                    Uncheck all
                </Button>
            </div>
            <List dense sx={{ width: "100%", bgcolor: "background.paper" }}>
                {ingrediantItems}
            </List>
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
}

export default IngrediantList
