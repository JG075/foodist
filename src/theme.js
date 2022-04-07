import { createTheme } from "@mui/material/styles"

const theme = createTheme({
    palette: {
        primary: {
            main: "#6f6f6f",
        },
    },
    components: {
        MuiInput: {
            styleOverrides: {
                root: {
                    ":after": {
                        borderBottom: 0,
                    },
                },
                underline: {
                    "&&:hover::before": {
                        borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
                    },
                },
            },
        },
    },
})

export default theme
