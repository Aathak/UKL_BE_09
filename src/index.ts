import express from 'express'
import cors from 'cors'
import barangroute from "./routers/barangroute"
import userroute from "./routers/userroute"
import PeminjamanRoute from './routers/peminjamanoute'
import analisis from "./routers/analisisroute"

const PORT: number = 8000
const app = express()
app.use(cors())

app.use("/inventory", barangroute)
app.use("/user", userroute)
app.use("/inventory", PeminjamanRoute)
app.use("/inventory", analisis)

app.listen (PORT, () => {
    console.log(`[server]: Server is tunning at http://localhost:${PORT}`)
})