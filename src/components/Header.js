/** @jsxImportSource @emotion/react */
import { Link } from "react-router-dom"

import { sectionStyle } from "../sharedStyles"

const Header = (props) => {
    return (
        <header
            css={{
                ...sectionStyle,
                textAlign: "left",
                margin: "12px auto",
                boxShadow: "3px 5px 0px 3px #8e484a",
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                padding: "20px",
                justifyContent: "space-between",
            }}
        >
            <span
                css={{
                    margin: 0,
                    fontSize: 26,
                    padding: "0px 20px 0 0",
                    fontWeight: "bold",
                }}
            >
                <a css={{ textDecoration: "none", color: "black" }} href="/">
                    Foodist
                </a>
            </span>
            <nav
                css={{
                    fontSize: 18,
                    fontWeight: 500,
                    a: {
                        color: "black",
                    },
                    "a:not(:last-child)": {
                        marginRight: 20,
                    },
                }}
            >
                <Link to="/signup">Signup</Link>
                <Link to="/login">Login</Link>
            </nav>
        </header>
    )
}

export default Header
