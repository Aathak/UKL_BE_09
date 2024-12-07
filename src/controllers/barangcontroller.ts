import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client"; //dipake untuk mendapatkan model atau data dalam database (mengakses skema yang sudah dibuat)

const prisma = new PrismaClient({ errorFormat: "pretty" }); //membuat objek baru (prisma) dari prismaclient

export const getAllBarang = async (request: Request, response: Response) => {
  try {
    //input
    const { search } = request.query;
    //main
    const allBarang = await prisma.barang.findMany({
    });

    //output
    return response
      .status(200)
      .json({
        status: true,
        data: allBarang,
        message: `Barang berhasil ditampilkan`,
      });
  } catch (error) {
    return response
      .status(400)
      .json({
        status: false,
        message: `There is an error. ${error}`,
      });
  }
};

export const getBarangbyID = async (req: Request, res: Response) => {
  try {
    //input
    const { id } = req.params;
    //main
    const barang = await prisma.barang.findUnique({
      where: { id: Number(id) }
    })

    if (!barang) {
      return res
      .status(404)
      .json({
         error: "Barang tidak ditemukan" 
        });
    }

    //output
    return res
      .status(200)
      .json({
        status: true,
        message: `Barang berhasil ditampilkan`,
        data: barang,
      });
  } catch (error) {
    return res
      .status(400)
      .json({
        status: false,
        message: `There is an error. ${error}`,
      });
  }
};

export const createBarang = async (req: Request, res: Response) => {
  try {
    //mengambil data
    const { name, category, location, quantity } = req.body;

    //proses penyimpanan menu baru
    const newBarang = await prisma.barang.create({
      data: { name, category, location, quantity },
    });

    //output
    return res
      .status(200).json({
        status: true,
        message: `Barang behasil ditambahkan`,
        data: newBarang,
      });
  } catch (error) {
    return res
      .status(400).json({
        status: false,
        message: `There is an error. ${error}`,
      });
  }
};

export const updateBarang = async (req: Request, res: Response) => {
  try {
    //mengambil data
    const { id } = req.params; //request params yang ingin di edit
    const { name, category, location, quantity } = req.body; //menambahkan body apa yang mau di ubah

    //proses penemuan apakah id yang kita input ada atau tidak?
    //Menunggunakan findFirst untuk mengambil data pertama yang muncul dr yang kita cari
    const findBarang = await prisma.barang.findFirst({ where: { id: Number(id) } });
    if (!findBarang)
      return res
        .status(200)
        .json({ status: false, message: `Menu is not found` });

    //jika ada, kita lanjut ke proses pengeditan menggunakan update
    //ketika mengedit, tidak wajib mengedit seluruh data. Oleh karena itu menggunakan gerbang logika OR
    //jika ada data yang tidak diisi, ia akan mengambil data lama untuk mengisi
    const updatedBarang = await prisma.barang.update({
      data: {
        name: name || findBarang.name,
        category: category || findBarang.category,
        location: location || findBarang.location,
        quantity: quantity || findBarang.quantity,
      },
      where: { id: Number(id) },
    });

    //output
    return res
      .status(200)
      .json({
        status: true,
        message: `Barang berhasil diubah`,
        data: updatedBarang,
      });
  } catch (error) {
    return res
      .status(400)
      .json({
        status: false,
        message: `There is an error. ${error}`,
      });
  }
};

export const deleteBarang = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; //Memilih id dari menu yang ingin di hapus melalui parameter

    // Mencari menu berdasarkan id
    const findBarang = await prisma.barang.findFirst({ where: { id: Number(id) } });
    if (!findBarang) {
      return res.status(404).json({
        status: "false",
        message: "Barang tidak ditemukan",
      });
    }

    // Menghapus menu
    await prisma.barang.delete({
      where: { id: Number(id) },
    });

    return res
      .status(200)
      .json({
        status: true,
        message: "Barang berhasil dihapus",
      });
  } catch (error) {
    return res
      .status(400)
      .json({
        status: false,
        message: `Error saat menghapus barang ${error}`,
      });
  }
};

