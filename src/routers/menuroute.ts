import express from "express";
import { getAllMenus } from "../controllers/menucontroller";

const app = express()
app.use(express.json())

app.get("/", getAllMenus) //slash doang biar ga dobel (yg ditulis yg di index doang)

export default app