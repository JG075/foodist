/** @jsxImportSource @emotion/react */
import { SxProps } from "@mui/material"
import TextField, { TextFieldProps } from "@mui/material/TextField"

import theme from "../theme"

interface IngrediantListNameProps {
    sx: SxProps
    value: TextFieldProps["value"]
    onChange: TextFieldProps["onChange"]
    disabled: TextFieldProps["disabled"]
}

const IngrediantListName = ({ sx, value, onChange, disabled }: IngrediantListNameProps) => {
    return (
        <TextField
            autoComplete="off"
            variant="standard"
            placeholder="Give your recipe a name"
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

export default IngrediantListName
