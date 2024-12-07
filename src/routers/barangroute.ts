import express from "express";
import {
  getAllBarang,
  getBarangbyID,
  createBarang,
  updateBarang,
  deleteBarang,
} from "../controllers/barangcontroller";
import { verifyAddBarang, verifyEditBarang } from "../middlewares/verifyBarang";
import { verifyRole, verifyToken } from "../middlewares/authorization";

const app = express();
app.use(express.json());

app.post(
  `/`,
  [verifyToken, verifyRole(["Admin"]), verifyAddBarang],
  createBarang
);
app.put(
  `/:id`,
  [verifyToken, verifyRole(["Admin"]), verifyEditBarang],
  updateBarang
);
app.get(`/:id`, [verifyToken, verifyRole(["Admin", "User"])], getBarangbyID);
app.get(`/`, [verifyToken, verifyRole(["Admin", "User"])], getAllBarang);
app.delete("/:id", deleteBarang);

//kalo perlu login pake authirization, kalo ga perlu gausa
export default app;