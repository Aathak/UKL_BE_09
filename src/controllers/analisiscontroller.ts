import { Request, Response } from "express";
import { PrismaClient  } from "@prisma/client"; //dipake untuk mendapatkan model atau data dalam database (mengakses skema yang sudah dibuat)
import { Status } from '@prisma/client'; // Impor Status enum dari Prisma jika sudah didefinisikan di schema

const prisma = new PrismaClient({ errorFormat: "pretty" }); //membuat objek baru (prisma) dari prismaclient

export const analisis = async (request: Request, response: Response) => {
  const { start_date, end_date, group_by } = request.body;

  // Validasi input
  if (!start_date || !end_date || !group_by) {
    return response.status(400).json({
      status: "error",
      message: "Tanggal mulai, tanggal akhir, dan kriteria pengelompokan harus diisi.",
    });
  }

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  // Validasi format tanggal
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return response.status(400).json({
      status: "error",
      message: "Format tanggal tidak valid.",
    });
  }

  try {
    let usageReport;
    let additionalInfo: Array<{ id: number; category?: string; location?: string }> = [];

    // Query untuk penggunaan barang berdasarkan kriteria pengelompokan
    if (group_by === 'category') {
      usageReport = await prisma.peminjaman.groupBy({
        by: ['id_barang'],
        where: {
          borrow_date: {
            gte: startDate,
          },
        },
        _count: {
          id_barang: true,
        },
        _sum: {
          quantity: true,
        },
      });

      // Ambil kategori barang berdasarkan id_barang
      const ids = usageReport.map(item => item.id_barang);
      additionalInfo = await prisma.barang.findMany({
        where: {
          id: { in: ids } // Pastikan menggunakan id yang benar
        },
        select: { id: true, category: true } // Pilih hanya id dan category
      });
    } else if (group_by === 'location') {
      usageReport = await prisma.peminjaman.groupBy({
        by: ['id_barang'],
        where: {
          borrow_date: {
            gte: startDate,
          },
        },
        _count: {
          id_barang: true,
        },
        _sum: {
          quantity: true,
        },
      });

      // Ambil lokasi barang berdasarkan id_barang
      const ids = usageReport.map(item => item.id_barang);
      additionalInfo = await prisma.barang.findMany({
        where: {
          id: { in: ids }
        },
        select: { id: true, location: true } // Pilih hanya id dan location
      });
    } else {
      return response.status(400).json({
        status: "error",
        message: "Kriteria pengelompokan tidak valid. Gunakan 'category' atau 'location'.",
      });
    }

    // Debug: Cek data yang diterima dari additionalInfo
    console.log('Additional Info:', additionalInfo);

    // Menghitung jumlah barang yang sudah dikembalikan
    const returnedItems = await prisma.peminjaman.groupBy({
      by: ['id_barang'],
      where: {
        borrow_date: {
          gte: startDate,
        },
        return_date: {
          gte: startDate,
          lte: endDate
        },
        status: Status.Kembali
      },
      _count: {
        id_barang: true,
      },
      _sum: {
        quantity: true,
      },
    });

    // Menghitung jumlah barang yang belum dikembalikan
    const notReturnedItems = await prisma.peminjaman.groupBy({
      by: ['id_barang'],
      where: {
        borrow_date: {
          gte: startDate,
        },
        OR: [
          { return_date: { gt: endDate } },
          { return_date: { equals: new Date(0) } },
          { status: Status.Dipinjam }
        ]
      },
      _count: {
        id_barang: true,
      },
      _sum: {
        quantity: true,
      },
    });

    // Menyusun data analisis
    const usageAnalysis = usageReport.map(item => {
      const info = additionalInfo.find(info => info.id === item.id_barang);
      
      // Debug: Cek hasil pencocokan
      console.log('Matching info for id_barang:', item.id_barang, info);

      const returnedItem = returnedItems.find(returned => returned.id_barang === item.id_barang);
      const totalReturned = returnedItem?._count?.id_barang ?? 0;
      const itemsInUse = item._count.id_barang - totalReturned;

      return {
        group: info ? info[group_by as keyof typeof info] : 'Unknown', // pastikan group_by adalah 'category' atau 'location'
        total_borrowed: item._count.id_barang,
        total_returned: totalReturned,
        items_in_use: itemsInUse
      };
    });

    // Menyusun output sesuai format yang diinginkan
    return response.status(200).json({
      status: "success",
      data: {
        analysis_period: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        },
        usage_analysis: usageAnalysis
      },
      message: "Laporan penggunaan barang berhasil dihasilkan.",
    });
  } catch (error) {
    return response.status(500).json({
      status: "error",
      message: `Terjadi kesalahan. ${(error as Error).message}`,
    });
  }
};

//BorrowAnalysis
export const borrowAnalysis = async (request: Request, response: Response) => {
  const { start_date, end_date } = request.body;

  // Validasi input
  if (!start_date || !end_date) {
      return response.status(400).json({
          status: "error",
          message: "Tanggal mulai dan tanggal akhir harus diisi.",
      });
  }

  // Validasi format tanggal
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return response.status(400).json({
          status: "error",
          message: "Format tanggal tidak valid.",
      });
  }

  try {
      // Query untuk mendapatkan barang paling sering dipinjam
      const frequentlyBorrowedItems = await prisma.peminjaman.groupBy({
          by: ['id_barang'],
          where: {
              borrow_date: {
                  gte: startDate,
              },
              return_date: {
                  lte: endDate,
              },
          },
          _count: {
              id_barang: true,
          },
          orderBy: {
              _count: {
                  id_barang: 'desc',
              }
          },
      });

      // Mendapatkan informasi tambahan untuk barang paling sering dipinjam
      const frequentlyBorrowedItemDetails = await Promise.all(frequentlyBorrowedItems.map(async item => {
          const barang = await prisma.barang.findUnique({
              where: { id: item.id_barang },
              select: { id: true, name: true, category: true },
          });
          return barang ? {
              item_id: item.id_barang,
              name: barang.name,
              category: barang.category,
              total_borrowed: item._count.id_barang,
          } : null;
      })).then(results => results.filter(item => item !== null)); // Menghapus item yang null

      // Query untuk mendapatkan barang dengan telat pengembalian
      const inefficientItems = await prisma.peminjaman.groupBy({
          by: ['id_barang'],
          where: {
              borrow_date: {
                  gte: startDate,
              },
              return_date: {
                  gt: endDate // Asumsikan telat pengembalian adalah jika return_date lebih besar dari end_date
              }
          },
          _count: {
              id_barang: true,
          },
          _sum: {
              quantity: true,
          },
          orderBy: {
              _count: {
                  id_barang: 'desc',
              }
          },
      });

// Log inefficient items untuk debugging
console.log("Inefficient Items Query Result:", inefficientItems);

// Mendapatkan informasi tambahan untuk barang yang telat pengembalian
const inefficientItemDetails = await Promise.all(inefficientItems.map(async item => {
  const barang = await prisma.barang.findUnique({
    where: { id: item.id_barang },
    select: { id: true, name: true, category: true },
  });
  return barang ? {
    item_id: item.id_barang,
    name: barang.name,
    category: barang.category,
    total_borrowed: item._count.id_barang,
    total_late_returns: item._sum.quantity ?? 0, // Menangani kemungkinan nilai undefined
  } : null;
})).then(results => results.filter(item => item !== null)); // Menghapus item yang null

// Mengirimkan response
response.status(200).json({
  status: "success",
  data: {
    analysis_period: {
      start_date: start_date,
      end_date: end_date
    },
    frequently_borrowed_items: frequentlyBorrowedItemDetails,
    inefficient_items: inefficientItemDetails
  },
  message: "Analisis barang berhasil dihasilkan.",
});
} catch (error) {
response.status(500).json({
  status: "error",
  message: `Terjadi kesalahan. ${(error as Error).message}`,
});
}
};