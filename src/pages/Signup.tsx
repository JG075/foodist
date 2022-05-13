/** @jsxImportSource @emotion/react */
import { useNavigate } from "react-router-dom"
import { LoadingButton } from "@mui/lab"
import { TextField } from "@mui/material"
import { useForm, Controller, FieldErrors } from "react-hook-form"
import { produce } from "immer"
import { useImmer } from "use-immer"

import { capitalize } from "../helpers/string"
import apiIngrediantList from "../api/IngrediantList"
import useLocalState from "../hooks/useLocalState"
import Title from "../components/Title"
import { useAuth } from "../hooks/auth"
import ErrorMsg from "../components/ErrorMsg"
import IngrediantList from "../models/IngrediantList"
import { handleNonAxiosError } from "../helpers/handleAxiosError"

const textFieldStyle = {
    width: "100%",
    marginBottom: "20px",
}

const defaultValues = {
    username: "",
    email: "",
    password: "",
    "repeat password": "",
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
    if (fieldError["type"] === "custom") {
        return fieldError.message
    }
    switch (fieldName) {
        case "username":
            if (fieldError["type"] === "pattern") {
                return "Username should only contain letters, numbers, and/or an underscore"
            }
            return ""
        default:
            return ""
    }
}

const Signup = () => {
    const {
        control,
        formState: { errors },
        handleSubmit,
        setError,
    } = useForm({
        defaultValues,
    })
    const [submitting, setSubmitting] = useImmer(false)
    const [formError, setFormError] = useImmer("")
    const navigate = useNavigate()
    const [ingrediantList] = useLocalState<IngrediantList | null>(null, "ingrediant-list", IngrediantList)
    const { signup } = useAuth()

    const onSubmit = async (data: typeof defaultValues) => {
        if (data["password"] !== data["repeat password"]) {
            setError("repeat password", { type: "custom", message: "Passwords do not match" })
            return
        }
        setFormError("")
        setSubmitting(true)
        const formattedData = {
            username: data.username,
            email: data.email,
            password: data.password,
        }
        try {
            const res = await signup(formattedData)
            if (ingrediantList instanceof IngrediantList) {
                const updatedIngrediantList = produce(ingrediantList, (draft) => {
                    draft.authorId = res.username
                })
                await apiIngrediantList.post(updatedIngrediantList)
            }
            navigate("/")
        } catch (err) {
            const error = handleNonAxiosError(err)
            if (error.response && /duplicate/i.test(error.response.data)) {
                const duplicateField = error.response.data.replace(/duplicate\s/i, "")
                setError(duplicateField, {
                    type: "custom",
                    message: `The ${duplicateField} you have entered has already been taken`,
                })
            } else {
                setFormError("Sorry something went wrong")
            }
        }
        setSubmitting(false)
    }

    return (
        <div>
            <Title>Sign up</Title>
            <form
                onSubmit={handleSubmit(onSubmit)}
                css={{
                    display: "flex",
                    flexDirection: "column",
                    maxWidth: "400px",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "0 auto",
                }}
            >
                <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            css={textFieldStyle}
                            label="Username"
                            variant="outlined"
                            error={"username" in errors}
                            helperText={getHelperText("username", errors)}
                            inputProps={{ maxLength: 30 }}
                        />
                    )}
                    rules={{ required: true, pattern: /^\w*$/ }}
                />
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
                            helperText={
                                getHelperText("password", errors) ||
                                "Requirements: At least 8 characters, lower case letter, upper case letter, number, and a special character (e.g. $%^&#)"
                            }
                        />
                    )}
                    rules={{
                        required: true,
                        pattern: /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
                    }}
                />
                <Controller
                    name="repeat password"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            css={textFieldStyle}
                            label="Repeat password"
                            type="password"
                            variant="outlined"
                            error={"repeat password" in errors}
                            helperText={getHelperText("repeat password", errors)}
                        />
                    )}
                    rules={{ required: true }}
                />
                <LoadingButton
                    type="submit"
                    variant="contained"
                    size="large"
                    color="secondary"
                    css={{ margin: "10px 0" }}
                    loading={submitting}
                >
                    Sign up
                </LoadingButton>
                {formError && <ErrorMsg css={{ textAlign: "center" }}>{formError}</ErrorMsg>}
            </form>
        </div>
    )
}

export default Signup
