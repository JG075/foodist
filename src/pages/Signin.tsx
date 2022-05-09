/** @jsxImportSource @emotion/react */
import { LoadingButton } from "@mui/lab"
import { TextField } from "@mui/material"
import { useForm, Controller, FieldErrors } from "react-hook-form"
import { useImmer } from "use-immer"

import { capitalize } from "../helpers/string"
import Title from "../components/Title"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/auth"
import ErrorMsg from "../components/ErrorMsg"
import { handleNonAxiosError } from "../helpers/handleAxiosError"

const textFieldStyle = {
    width: "100%",
    marginBottom: "20px",
}

const defaultValues = {
    email: "",
    password: "",
}

type Errors = FieldErrors<typeof defaultValues>

const getHelperText = (fieldName: keyof typeof defaultValues, errors: Errors) => {
    const fieldError = errors[fieldName]
    if (!fieldError) {
        return ""
    }
    if (fieldError["type"] === "required") {
        return `${capitalize(fieldName)} is required`
    }
}

const Signin = () => {
    const {
        control,
        formState: { errors },
        handleSubmit,
    } = useForm({
        defaultValues,
    })
    const [formError, setFormError] = useImmer("")
    const [submitting, setSubmitting] = useImmer(false)
    const navigate = useNavigate()
    const { signin } = useAuth()

    const onSubmit = async (data: typeof defaultValues) => {
        setSubmitting(true)
        try {
            await signin(data)
            navigate("/")
        } catch (err) {
            const error = handleNonAxiosError(err)
            if (error.response && error.response.status === 403) {
                setFormError("Incorrect username or password.")
            } else {
                setFormError("Sorry something went wrong.")
            }
        }
        setSubmitting(false)
    }

    return (
        <form
            css={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "400px",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto",
            }}
            onSubmit={handleSubmit(onSubmit)}
        >
            <Title>Sign in</Title>
            <Controller
                name="email"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        css={textFieldStyle}
                        label="Email"
                        type="email"
                        variant="outlined"
                        error={"email" in errors}
                        helperText={getHelperText("email", errors)}
                    />
                )}
                rules={{ required: true }}
            />
            <Controller
                name="password"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        css={textFieldStyle}
                        label="Password"
                        type="password"
                        variant="outlined"
                        error={"password" in errors}
                        helperText={getHelperText("password", errors)}
                    />
                )}
                rules={{
                    required: true,
                }}
            />
            <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                color="secondary"
                css={{ margin: "10px 0" }}
                loading={submitting}
            >
                Sign in
            </LoadingButton>
            {formError && <ErrorMsg css={{ textAlign: "center", marginTop: 20 }}>{formError}</ErrorMsg>}
        </form>
    )
}

export default Signin
