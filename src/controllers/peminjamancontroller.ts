import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Peminjaman Barang
export const borrowItem = async (req: Request, res: Response) => {
  try {
    const { user_id, item_id, borrow_date, return_date, quantity } = req.body;

    // Validasi input
    if (!user_id || !item_id || !borrow_date || !return_date || !quantity) {
      return res.status(400).json({
        status: false,
        message: "Semua field (user_id, item_id, borrow_date, return_date, quantity) wajib diisi.",
      });
    }

    // Validasi apakah format tanggal benar (YYYY-MM-DD)
    if (!isValidDate(borrow_date) || !isValidDate(return_date)) {
      return res.status(400).json({
        status: false,
        message: "Format tanggal tidak valid. Gunakan format 'YYYY-MM-DD'.",
      });
    }

    // Validasi jika borrow_date lebih besar dari return_date
    if (new Date(borrow_date) > new Date(return_date)) {
      return res.status(400).json({
        status: false,
        message: "Tanggal peminjaman tidak boleh lebih besar dari tanggal pengembalian.",
      });
    }

    // Cek apakah barang tersedia
    const barang = await prisma.barang.findUnique({
      where: { id: item_id },
    });

    if (!barang) {
      return res.status(404).json({
        status: false,
        message: "Barang tidak ditemukan.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User tidak ditemukan.",
      });
    }

    // Validasi apakah jumlah barang mencukupi
    if (barang.quantity < quantity) {
      return res.status(400).json({
        status: false,
        message: `Stok barang tidak mencukupi. Stok tersedia: ${barang.quantity}`,
      });
    }

    // Kurangi stok barang
    await prisma.barang.update({
      where: { id: item_id },
      data: { quantity: barang.quantity - quantity },
    });

    // Catat peminjaman
    const peminjaman = await prisma.peminjaman.create({
      data: {
        id_user: user_id,
        id_barang: item_id,
        quantity,
        borrow_date: new Date(borrow_date),
        return_date: new Date(return_date),
        status: "Dipinjam",
      },
    });

    // Response
    return res.status(201).json({
      status: "success",
      message: "Peminjaman berhasil dicatat.",
      data: {
        borrow_id: peminjaman.id_peminjaman,
        user_id,
        item_id,
        quantity,
        borrow_date,
        return_date,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Terjadi kesalahan: ${error}`,
    });
  }
};

// Fungsi validasi format tanggal
const isValidDate = (date: string): boolean => {
  const parsedDate = Date.parse(date);
  return !isNaN(parsedDate) && /^\d{4}-\d{2}-\d{2}$/.test(date);
};


export const returnItem = async (req: Request, res: Response) => {
  try {
    const { borrow_id, return_date } = req.body;

    // Validasi input
    if (!borrow_id || !return_date) {
      return res.status(400).json({
        status: false,
        message: "Field 'borrow_id' dan 'return_date' wajib diisi.",
      });
    }

    // Validasi format tanggal
    if (!ValidDate(return_date)) {
      return res.status(400).json({
        status: false,
        message: "Format tanggal tidak valid. Gunakan format 'YYYY-MM-DD'.",
      });
    }

    // Cari data peminjaman berdasarkan borrow_id
    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id_peminjaman: borrow_id },
      include: { barang: true }, // Termasuk data barang
    });

    // Validasi apakah data peminjaman ditemukan
    if (!peminjaman) {
      return res.status(404).json({
        status: false,
        message: "Peminjaman tidak ditemukan.",
      });
    }

    // Cek apakah barang sudah dikembalikan
    if (peminjaman.status === "Kembali") {
      return res.status(400).json({
        status: false,
        message: "Barang sudah dikembalikan sebelumnya.",
      });
    }

    // Cek apakah tanggal pengembalian valid (tidak sebelum tanggal peminjaman)
    if (new Date(return_date) < new Date(peminjaman.borrow_date)) {
      return res.status(400).json({
        status: false,
        message: "Tanggal pengembalian tidak boleh sebelum tanggal peminjaman.",
      });
    }

    // Update status peminjaman menjadi Kembali
    const updatedPeminjaman = await prisma.peminjaman.update({
      where: { id_peminjaman: borrow_id },
      data: {
        status: "Kembali",
        return_date: new Date(return_date), // Update tanggal pengembalian
      },
    });

    // Tambahkan kembali stok barang
    await prisma.barang.update({
      where: { id: peminjaman.id_barang },
      data: {
        quantity: peminjaman.barang.quantity + peminjaman.quantity,
      },
    });

    // Response sukses
    return res.status(200).json({
      status: "success",
      message: "Pengembalian berhasil dicatat.",
      data: {
        borrow_id: updatedPeminjaman.id_peminjaman,
        user_id: updatedPeminjaman.id_user,
        item_id: updatedPeminjaman.id_barang,
        actual_return_date: updatedPeminjaman.return_date.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Terjadi kesalahan: ${error}`,
    });
  }
};

// Fungsi validasi format tanggal
const ValidDate = (date: string): boolean => {
  const parsedDate = Date.parse(date);
  return !isNaN(parsedDate) && /^\d{4}-\d{2}-\d{2}$/.test(date);
};
