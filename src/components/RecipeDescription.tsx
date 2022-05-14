import React from "react"
import TextField, { StandardTextFieldProps } from "@mui/material/TextField"
import { omit } from "lodash"

export interface RecipeDescriptionProps extends StandardTextFieldProps {}

const RecipeDescription = React.forwardRef((props: RecipeDescriptionProps, ref) => {
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

export default RecipeDescription
