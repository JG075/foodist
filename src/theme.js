import { createTheme } from "@mui/material/styles"

const theme = createTheme({
    palette: {
        primary: {
            main: "#6f6f6f",
            dark: "#1f1f1f",
        },
        secondary: {
            main: "#4c8e48",
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
                    "&&::before": {
                        borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
                        borderBottomStyle: "dashed",
                    },
                    "&&:hover::before": {
                        borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
                        borderBottomStyle: "dashed",
                    },
                },
            },
        },
    },
})

export default theme
