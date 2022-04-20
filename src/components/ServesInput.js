/** @jsxImportSource @emotion/react */
import TextField from "@mui/material/TextField"
import PropTypes from "prop-types"

import theme from "../theme"

const ServesInput = ({ amount }) => {
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
            <label htmlFor="serves-amount">Serves</label>
            <TextField
                id="serves-amount"
                type="number"
                value={amount}
                sx={{
                    marginLeft: "10px",
                    width: "70px",
                    "input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button": {
                        opacity: 1,
                    },
                    color: "secondary",
                }}
                inputProps={{
                    maxLength: 3,
                    defaultValue: 1,
                }}
                size="small"
                variant="outlined"
            />
        </div>
    )
}

ServesInput.propTypes = {
    amount: PropTypes.number,
}

export default ServesInput
