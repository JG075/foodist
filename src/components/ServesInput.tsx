/** @jsxImportSource @emotion/react */
import TextField, { TextFieldProps } from "@mui/material/TextField"

import theme from "../theme"

interface ServesInputProps {
    amount: TextFieldProps["value"]
    onChange?: TextFieldProps["onChange"]
    disabled: TextFieldProps["disabled"]
}

const ServesInput = ({ amount, onChange, disabled }: ServesInputProps) => {
    return (
        <div
            css={{
                margin: "20px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.125rem",
                color: theme.palette.primary.main,
            }}
        >
            <label htmlFor="serves-amount" css={{ marginBottom: 1 }}>
                Serves
            </label>
            <TextField
                id="serves-amount"
                type="number"
                value={amount}
                sx={{
                    marginLeft: "10px",
                    width: "40px",
                    color: "primary",
                }}
                inputProps={{
                    min: "1",
                    sx: {
                        textAlign: "center",
                        padding: 0,
                        fontSize: "1.125rem",
                        color: theme.palette.primary.main,
                    },
                }}
                size="small"
                variant="standard"
                onChange={onChange}
                disabled={disabled}
            />
        </div>
    )
}

export default ServesInput
