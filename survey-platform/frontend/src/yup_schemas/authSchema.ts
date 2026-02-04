import * as yup from 'yup'

export const authSchema = yup.object().shape({
    username: yup.string().required('Username is required.'),
    email: yup.string().email('Incorrect email.').required('Email is required.'),
    password: yup.string().required('Password is required.').min(8, 'Password must be at least 8 characters long'),
    terms: yup.boolean().required('Please accept the terms to continue.').isTrue('Please accept the terms to continue.')
})

export const loginSchema = yup.object().shape({
    emailOrUsername: yup.string().required('Email or username is required.'),
    loginPassword: yup.string().required('Password is required.')
})