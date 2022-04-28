/** @jsxImportSource @emotion/react */
import TextField from "@mui/material/TextField"
import PropTypes from "prop-types"

import theme from "../theme"

const IngrediantListName = ({ sx, value, onChange, disabled }) => {
    return (
        <TextField
            autoComplete="off"
            variant="standard"
            placeholder="Give your list a name"
            size="medium"
            value={value}
            onChange={onChange}
            sx={sx}
            inputProps={{
                sx: {
                    color: theme.palette.primary.dark,
                    textFillColor: theme.palette.primary.dark,
                    fontSize: "1.625rem",
                    textAlign: "center",
                    fontWeight: "500",
                    paddingBottom: "8px",
                    "&.Mui-disabled": {
                        textFillColor: theme.palette.primary.dark,
                        opacity: 1,
                    },
                },
            }}
            disabled={disabled}
        />
    )
}

IngrediantListName.propTypes = {
    sx: PropTypes.object,
    value: PropTypes.string,
    onChange: PropTypes.func,
}

export default IngrediantListName
