import AdderLink, { AdderLinkProps } from "./AdderLink"

export interface DescriptionAdderProps extends AdderLinkProps {}

const DescriptionAdder = (props: DescriptionAdderProps) => {
    return (
        <AdderLink aria-label="Add description" {...props}>
            Description
        </AdderLink>
    )
}

export default DescriptionAdder
