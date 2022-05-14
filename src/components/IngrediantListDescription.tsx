import React from "react"
import TextField, { StandardTextFieldProps } from "@mui/material/TextField"
import { omit } from "lodash"

export interface IngrediantListDescriptionProps extends StandardTextFieldProps {}

const IngrediantListDescription = React.forwardRef((props: IngrediantListDescriptionProps, ref) => {
    return (
        <TextField
            sx={{ width: "100%", ...props.sx }}
            placeholder="Enter a description..."
            variant="standard"
            multiline
            inputProps={{
                ref: ref,
            }}
            {...omit(props, "sx")}
        />
    )
})

export default IngrediantListDescription
