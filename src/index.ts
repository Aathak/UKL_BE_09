import express from 'express'
import cors from 'cors'
import menuroute from "./routers/menuroute"

const PORT: number = 8000
const app = express()
app.use(cors())

app.use("/menu", menuroute)

app.listen (PORT, () => {
    console.log(`[server]: Server is tunning at http://localhost:${PORT}`)
})