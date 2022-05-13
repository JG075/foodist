import Link, { LinkProps } from "@mui/material/Link"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import { omit } from "lodash"

export interface AdderLinkProps extends LinkProps {}

const AdderLink = (props: AdderLinkProps) => {
    return (
        <Link
            sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                textDecoration: "none",
                borderBottom: "2px solid white",
                fontSize: "1rem",
                transition: "all 100ms ease-in",
                transitionProperty: "border color",
                "&:hover": {
                    color: "#8e484a",
                    borderBottom: "2px solid #8e484a",
                },
                ...props?.sx,
            }}
            {...omit(props, "sx", "children")}
        >
            <AddCircleOutlineIcon fontSize="small" />
            {props.children}
        </Link>
    )
}

export default AdderLink
