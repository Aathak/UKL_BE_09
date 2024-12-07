import { request, Request, response, Response } from "express";
import { PrismaClient } from "@prisma/client"; //dipake untuk mendapatkan model atau data dalam database (mengakses skema yang sudah dibuat)
import md5 from "md5";
import { sign } from "jsonwebtoken";
import { SECRET } from "../global";

const prisma = new PrismaClient({ errorFormat: "pretty" }); //membuat objek baru (prisma) dari prismaclient

export const getAllUsers = async (request: Request, response: Response) => {
  try {
    //input
    const { search } = request.query;
    //main
    const allUsers = await prisma.user.findMany({
      where: { username: { contains: search?.toString() || "" } },
    });

    //output
    return response
      .status(200)
      .json({
        status: true,
        data: allUsers,
        message: `User berhasil ditampilkan`,
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

export const createUser = async (request: Request, response: Response) => {
  try {
    //mengambil data
    const { username, password, role} = request.body;

    // Validasi: Cek apakah username sudah ada
    const existingUser = await prisma.user.findUnique({
      where: {
        username: username, // Cek username yang dikirim dari request body
      },
    });

    if (existingUser) {
      return response.status(400).json({
        status: false,
        message: "Username already exists", // Pesan error jika username sudah ada
      });
    }

    //proses penyimpanan user baru
    const newUser = await prisma.user.create({
      data: { username, password, role},
    });

    //output
    return response
      .json({
        status: true,
        data: newUser,
        message: `User telah ditambah`,
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400);
  }
};

export const updateUser = async (request: Request, response: Response) => {
  try {
    //mengambil data
    const { id } = request.params; //request params yang ingin di edit
    const { username, password, role } = request.body; //menambahkan body apa yang mau di ubah

    //proses penemuan apakah id yang kita input ada atau tidak?
    //Menunggunakan findFirst untuk mengambil data pertama yang muncul dr yang kita cari
    const findUser = await prisma.user.findFirst({ where: { id: Number(id) } });
    if (!findUser)
      return response
        .status(200)
        .json({ status: false, message: `User tidak ditemukan` });

    //jika ada, kita lanjut ke proses pengeditan menggunakan update
    //ketika mengedit, tidak wajib mengedit seluruh data. Oleh karena itu menggunakan gerbang logika OR
    //jika ada data yang tidak diisi, ia akan mengambil data lama untuk mengisi
    const updatedMenu = await prisma.user.update({
      data: {
        username: username || findUser.username,
        password: password || findUser.password,
        role: role || findUser.role,
      },
      where: { id: Number(id) },
    });

    //output
    return response
      .json({
        status: true,
        data: updatedMenu,
        message: `User has updated`,
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; //Memilih id dari menu yang ingin di hapus melalui parameter

    // Mencari menu berdasarkan id
    const findUser = await prisma.user.findFirst({ where: { id: Number(id) } });
    if (!findUser) {
      return res.status(404).json({
        status: false,
        message: "User tidak ditemukan",
      });
    }

    // Menghapus menu
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return res
      .json({
        status: true,
        message: "User has deleted",
      })
      .status(200);
  } catch (error) {
    return res
      .json({
        status: false,
        message: `Error saat menghapus user ${error}`,
      })
      .status(400);
  }
};

export const aunthentication = async (req: Request, res: Response) => {
  try {
    const { username, password, role} = req.body;

    const findUser = await prisma.user.findFirst({
      where: { username, password, role},
    });

    if (!findUser)
      return res.status(200).json({
        status: false,
        logged: false,
        message: `username or password is invalid`,
      });

    let payload = {
      id: findUser.id,
      username: findUser.username,
      role: findUser.role
    };

    let token = sign(payload, SECRET || "token");
    //sign utk generate token

    return res
      .status(200)
      .json({ 
        status: true, 
        logged: true, 
        message: `login berhasil`, token });
  } catch (error) {
    return res
      .json({
        status: false,
        message: `Error ${error}`,
      })
      .status(400);
  }
};