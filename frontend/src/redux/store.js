import { configureStore } from '@reduxjs/toolkit'
import { middleware } from './middleware'

export const makeStore = () => {
    return configureStore({
        reducer: {},
        middleware,
    })
}