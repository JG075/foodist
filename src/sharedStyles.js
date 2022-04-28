const maxSectionWidth = 40

export const sectionStyle = {
    boxSizing: "border-box",
    minWidth: "20.625rem",
    maxWidth: `${maxSectionWidth}rem`,
    borderRadius: 8,
    background: "#fff",
    border: "2px solid #681111",
    padding: "15px 0",
}

const breakpoints = [maxSectionWidth]

export const mq = breakpoints.map((bp) => `@media (min-width: ${bp}rem)`)
