/** @jsxImportSource @emotion/react */
import PropTypes from "prop-types"

const Title = (props) => {
    return (
        <h1
            css={{
                marginTop: "0",
                fontSize: "26px",
                marginBottom: "30px",
                fontWeight: 500,
            }}
        >
            {props.children}
        </h1>
    )
}

Title.propTypes = {
    children: PropTypes.node,
}

export default Title
