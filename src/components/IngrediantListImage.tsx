/** @jsxImportSource @emotion/react */
import DeleteIcon from "@mui/icons-material/Delete"
import IconButton, { IconButtonProps } from "@mui/material/IconButton"
import CircularProgress from "@mui/material/CircularProgress"

export interface IngrediantListImageProps {
    url: string
    isLoading: boolean
    onDelete: IconButtonProps["onClick"]
    allowEdit?: boolean
}

const IngrediantListImage = ({ url, isLoading, onDelete, allowEdit }: IngrediantListImageProps) => {
    return (
        <div
            css={{
                height: 240,
                marginTop: 10,
                position: "relative",
                ":hover": {
                    ".overlay": {
                        opacity: 1,
                        transition: "opacity 200ms ease-in-out",
                    },
                },
            }}
            aria-label="Image box"
        >
            {isLoading ? (
                <div
                    css={{
                        background: "#efefef",
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <CircularProgress />
                </div>
            ) : (
                <>
                    {allowEdit && (
                        <div
                            className="overlay"
                            css={{
                                background: "rgba(0,0,0,0.3)",
                                opacity: 0,
                                height: "100%",
                                width: "100%",
                                position: "absolute",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <IconButton aria-label="Delete image" onClick={onDelete}>
                                <DeleteIcon sx={{ fontSize: 50, color: "#fff" }} />
                            </IconButton>
                        </div>
                    )}
                    <div
                        role="img"
                        css={{
                            height: 240,
                            width: "100%",
                            background: `url(${url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    ></div>
                </>
            )}
        </div>
    )
}

export default IngrediantListImage
