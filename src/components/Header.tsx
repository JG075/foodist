/** @jsxImportSource @emotion/react */
import { Link, LinkProps } from "react-router-dom"

import { sectionStyle } from "../sharedStyles"
import theme from "../theme"
import User from "../models/User"

interface HeaderProps {
    user: User | null
    onSignout: LinkProps["onClick"]
}

const Header = ({ user, onSignout }: HeaderProps) => {
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
                    fontSize: "1.625rem",
                    padding: "0px 20px 0 0",
                    fontWeight: "bold",
                }}
            >
                <a css={{ textDecoration: "none", color: theme.palette.primary.dark }} href="/">
                    Foodist
                </a>
            </span>
            <nav
                css={{
                    fontSize: "1.125rem",
                    fontWeight: 500,
                    a: {
                        color: "black",
                    },
                    "a:not(:last-child)": {
                        marginRight: 20,
                    },
                }}
            >
                {user && (
                    <>
                        <Link to="/" onClick={onSignout}>
                            Sign out
                        </Link>
                    </>
                )}
                {!user && (
                    <>
                        <Link to="/signup">Sign up</Link>
                        <Link to="/signin">Sign in</Link>
                    </>
                )}
            </nav>
        </header>
    )
}

export default Header
