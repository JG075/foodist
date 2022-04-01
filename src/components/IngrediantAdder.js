/** @jsxImportSource @emotion/react */
import PropTypes from "prop-types"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn"
import IconButton from "@mui/material/IconButton"

function IngrediantAdder({ value, onChange, onSubmit, error, helperText }) {
    return (
        <form onSubmit={onSubmit}>
            <TextField
                placeholder="Enter an ingrediant and quantity e.g. 2 lemons, mozzarella 50g"
                value={value}
                onChange={onChange}
                fullWidth
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton aria-label="enter" onClick={onSubmit} edge="end">
                                <KeyboardReturnIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                error={error}
                helperText={helperText}
                sx={{
                    margin: "25px 0 20px",
                }}
                css={{
                    ".MuiOutlinedInput-notchedOutline": {
                        border: "2px solid #7a7a7a",
                    },
                }}
                autoComplete="off"
            />
        </form>
    )
}

IngrediantAdder.propsTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    error: PropTypes.bool,
    helperText: PropTypes.string,
}

export default IngrediantAdder
