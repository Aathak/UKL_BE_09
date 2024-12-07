import express from "express";
import { borrowItem, returnItem } from "../controllers/peminjamancontroller";
import {
  validateBorrowRequest,
  validateReturnRequest,
} from "../middlewares/peminjaman";
import {verifyToken, verifyRole} from "../middlewares/authorization" 


const router = express.Router();

// Route untuk peminjaman barang
router.post("/borrow", [verifyToken, verifyRole(["Admin", "User"])], validateBorrowRequest,borrowItem);

// Route untuk pengembalian barang
router.post("/return", [verifyToken, verifyRole(["Admin", "User"])], validateReturnRequest,returnItem);

export default router;
