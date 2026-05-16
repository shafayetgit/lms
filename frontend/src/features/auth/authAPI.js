import api from "@/redux/api"

const PREFIX = "api/v1/auth"

const authAPI = api.injectEndpoints({
    endpoints: builder => ({
        signIn: builder.mutation({
            query: body => ({
                url: `${PREFIX}/token`,
                method: "POST",
                body,
            }),
        }),

        signUp: builder.mutation({
            query: body => ({
                url: `${PREFIX}/register`,
                method: "POST",
                body,
            }),
        }),

        meta: builder.query({
            query: () => `${PREFIX}/meta`,
        }),

        forgotPassword: builder.mutation({
            query: body => ({
                url: `${PREFIX}/forgot-password`,
                method: "POST",
                body,
            }),
        }),

        forgotPasswordReset: builder.mutation({
            query: body => ({
                url: `${PREFIX}/reset-password`,
                method: "POST",
                body,
            }),
        }),

        resendOTP: builder.mutation({
            query: body => ({
                url: `${PREFIX}/resend-otp`,
                method: "POST",
                body,
            }),
        }),

        changePassword: builder.mutation({
            query: body => ({
                url: `${PREFIX}/change-password`,
                method: "POST",
                body,
            }),
        }),

        verifyEmail: builder.mutation({
            query: body => ({
                url: `${PREFIX}/verify-email`,
                method: "POST",
                body,
            }),
        }),
    }),
    overrideExisting: false,
})

export const {
    useSignInMutation,
    useSignUpMutation,
    useMetaQuery,
    useForgotPasswordMutation,
    useForgotPasswordResetMutation,
    useResendOTPMutation,
    useChangePasswordMutation,
    useVerifyEmailMutation,
} = authAPI
export default authAPI
