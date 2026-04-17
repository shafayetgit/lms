import { configureStore } from '@reduxjs/toolkit'
import { middleware } from './middleware'
import reducers from './reducers'

export const makeStore = () => {
    return configureStore({
        reducer: reducers,
        middleware,
    })
}