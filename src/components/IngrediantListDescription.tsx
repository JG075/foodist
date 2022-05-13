import React from "react"
import TextField, { StandardTextFieldProps } from "@mui/material/TextField"

export interface IngrediantListDescriptionProps extends StandardTextFieldProps {}

const IngrediantListDescription = React.forwardRef((props: IngrediantListDescriptionProps, ref) => {
    return (
        <TextField
            sx={{ width: "100%" }}
            placeholder="Enter a description..."
            variant="standard"
            multiline
            inputProps={{
                ref: ref,
            }}
            {...props}
        />
    )
})

export default IngrediantListDescription
