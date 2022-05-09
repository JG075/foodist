/** @jsxImportSource @emotion/react */
import TextField, { TextFieldProps } from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn"
import IconButton from "@mui/material/IconButton"

import theme from "../theme"
import { FormEventHandler } from "react"

interface IngrediantAdderProps {
    value: TextFieldProps["value"]
    onChange: TextFieldProps["onChange"]
    onSubmit: FormEventHandler
    error?: TextFieldProps["error"]
    helperText?: TextFieldProps["helperText"]
}

function IngrediantAdder({ value, onChange, onSubmit, error, helperText }: IngrediantAdderProps) {
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
                    margin: "20px 0 10px",
                }}
                css={{
                    ".MuiOutlinedInput-notchedOutline": {
                        border: `1px solid ${theme.palette.primary.light}`,
                    },
                    ".MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        border: `1px solid ${theme.palette.primary.main}`,
                    },
                }}
                autoComplete="off"
            />
        </form>
    )
}

export default IngrediantAdder
