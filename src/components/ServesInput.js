/** @jsxImportSource @emotion/react */
import TextField from "@mui/material/TextField"
import PropTypes from "prop-types"

import theme from "../theme"

const ServesInput = ({ amount, onChange, disabled }) => {
    return (
        <div
            css={{
                margin: "20px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
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
                        fontSize: "18px",
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

ServesInput.propTypes = {
    amount: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
}

export default ServesInput
