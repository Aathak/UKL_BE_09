import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client"; //dipake untuk mendapatkan model atau data dalam database (mengakses skema yang sudah dibuat)
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient ({ errorFormat: "pretty" }) //membuat objek baru (prisma) dari prismaclient

export const getAllMenus = async ( request: Request, response: Response) => {
    try {
        //input
        const { search } = request.query
        //main
        const allMenus = await prisma.menu.findMany({
            where : { name: { contains: search?.toString() || "" }}
        })

        //output
        return response.json({
            status: true,
            data: allMenus,
            message: `Menus has retrieved`
        }).status(200)
    } catch (error) {
        return response
        .json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    };
}

