/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"

import theme from "../theme"

export const ListSaveStates = {
    saving: "saving",
    saved: "saved",
    error: "error",
}

const minAnimationTime = process.env.NODE_ENV === "test" ? 11 : 1200
const animationSpeed = process.env.NODE_ENV === "test" ? 10 : 300

const ListSaveStatus = ({ saveState }) => {
    const [displayText, setDisplayText] = useState("Saved")
    const interval = useRef()
    const reachedMinTime = useRef(false)
    const refIsSaving = useRef(false)

    useEffect(() => {
        const stopAnimating = () => {
            clearInterval(interval.current)
            interval.current = 0
            reachedMinTime.current = false
        }
        if (saveState === ListSaveStates.error) {
            stopAnimating()
            return
        }
        const isSaving = saveState === ListSaveStates.saving
        refIsSaving.current = isSaving
        if (interval.current) {
            if (!isSaving && reachedMinTime.current) {
                stopAnimating()
                setDisplayText("Saved")
            }
            return
        }
        if (isSaving) {
            let i = 0
            let animatingTime = 0
            interval.current = setInterval(() => {
                const dots = Array((i = i > 2 ? 0 : i + 1))
                    .fill(".")
                    .join("")
                setDisplayText("Saving" + dots)
                animatingTime += animationSpeed
                if (animatingTime >= minAnimationTime) {
                    reachedMinTime.current = true
                    if (!refIsSaving.current) {
                        stopAnimating()
                        setDisplayText("Saved")
                    }
                }
            }, animationSpeed)
        }
    }, [saveState])

    useEffect(() => () => clearInterval(interval.current), [])

    const hasError = saveState === ListSaveStates.error

    return (
        <div
            css={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center",
                color: hasError ? theme.palette.error.main : "#658f65",
            }}
        >
            <span
                css={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                    boxSizing: "border-box",
                    padding: "4px 9px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: hasError ? theme.palette.error.main : "#658f65",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                }}
            >
                <div>{hasError ? "Error saving" : displayText}</div>
            </span>
        </div>
    )
}

ListSaveStatus.propTypes = {
    pageState: PropTypes.oneOf(Object.keys(ListSaveStates).map((k) => ListSaveStates[k])),
}

export default ListSaveStatus
