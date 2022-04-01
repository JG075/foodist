/** @jsxImportSource @emotion/react */
import TextField from "@mui/material/TextField"

const IngrediantListName = () => {
    return (
        <TextField
            autoComplete="off"
            variant="standard"
            placeholder="Give your list a name"
            size="medium"
            inputProps={{
                sx: {
                    fontSize: "26px",
                    textAlign: "center",
                    fontWeight: "500",
                },
            }}
        />
    )
}

export default IngrediantListName
