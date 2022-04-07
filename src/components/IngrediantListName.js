/** @jsxImportSource @emotion/react */
import TextField from "@mui/material/TextField"
import PropTypes from "prop-types"

const IngrediantListName = ({ sx, value, onChange }) => {
    return (
        <TextField
            autoComplete="off"
            variant="standard"
            placeholder="Give your list a name"
            size="medium"
            value={value}
            onChange={onChange}
            inputProps={{
                sx: {
                    fontSize: "26px",
                    textAlign: "center",
                    fontWeight: "500",
                },
            }}
            sx={sx}
        />
    )
}

IngrediantListName.propTypes = {
    sx: PropTypes.object,
    value: PropTypes.string,
    onChange: PropTypes.func,
}

export default IngrediantListName
