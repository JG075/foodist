import { createTheme } from "@mui/material/styles"

const globalTheme = {
    palette: {
        primary: {
            light: "#9f9f9f",
            main: "#6f6f6f",
            dark: "#1f1f1f",
        },
        secondary: {
            main: "#4c8e48",
        },
    },
}

const theme = createTheme({
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
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    ".MuiOutlinedInput-notchedOutline": {
                        border: `1px solid ${globalTheme.palette.primary.light}`,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        border: `1px solid ${globalTheme.palette.primary.dark}`,
                    },
                },
            },
        },
    },
    ...globalTheme,
})

export default theme
