import express from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  aunthentication
} from "../controllers/usercontroller";
import { verifyAddUser, verifyEditUser} from "../middlewares/verifyUser";
import { verifyAuthentication } from "../middlewares/userValidation";

const app = express();
app.use(express.json());

app.get("/", getAllUsers); //slash doang biar ga dobel (yg ditulis yg di index doang)
app.post(`/`, [verifyAddUser], createUser);
app.put(`/:id`, [verifyEditUser], updateUser );
app.delete("/:id", deleteUser);
app.post(`/login`, [verifyAuthentication], aunthentication);

export default app;
