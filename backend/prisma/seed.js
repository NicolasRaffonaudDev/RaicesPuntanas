require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const seed = async () => {
  const adminPasswordHash = await bcrypt.hash("admin1234", 10);

  await prisma.user.upsert({
    where: { email: "admin@raicespuntanas.local" },
    update: {},
    create: {
      name: "Admin Raices",
      email: "admin@raicespuntanas.local",
      role: "admin",
      passwordHash: adminPasswordHash,
    },
  });

  const lotes = [
    {
      title: "Lote Costero en Santa Teresita",
      price: 50000,
      size: 500,
      amenities: ["Cerca playa", "Parrilla", "Electricidad"],
      image: "https://via.placeholder.com/300x200?text=Lote+1",
      lat: -34.6037,
      lng: -58.3816,
    },
    {
      title: "Terreno Rural en Buenos Aires",
      price: 30000,
      size: 800,
      amenities: ["Jardin amplio", "Cochera"],
      image: "https://via.placeholder.com/300x200?text=Lote+2",
      lat: -34.6037,
      lng: -58.3816,
    },
    {
      title: "Lote Urbano Premium",
      price: 70000,
      size: 400,
      amenities: ["Pileta", "Seguridad 24h"],
      image: "https://via.placeholder.com/300x200?text=Lote+3",
      lat: -34.6037,
      lng: -58.3816,
    },
  ];

  const amenityMap = new Map();
  const amenityNames = Array.from(new Set(lotes.flatMap((lote) => lote.amenities)));

  for (const name of amenityNames) {
    const amenity = await prisma.amenity.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    amenityMap.set(name, amenity.id);
  }

  for (const lote of lotes) {
    const existing = await prisma.lote.findFirst({ where: { title: lote.title } });
    if (!existing) {
      const { amenities, ...rest } = lote;
      await prisma.lote.create({
        data: {
          ...rest,
          amenities: {
            connect: amenities.map((name) => ({ id: amenityMap.get(name) })).filter((item) => item.id),
          },
        },
      });
    }
  }

  const clientes = [
    { nombre: "Carlos Mendez", email: "carlos@demo.com", telefono: "+54 9 266 4000001" },
    { nombre: "Elena Ponce", email: "elena@demo.com", telefono: "+54 9 266 4000002" },
  ];

  for (const cliente of clientes) {
    await prisma.cliente.upsert({
      where: { email: cliente.email },
      update: { nombre: cliente.nombre, telefono: cliente.telefono },
      create: cliente,
    });
  }

  const productos = [
    { nombre: "Cartel de Lote", sku: "PROD-001", precio: 35000, stock: 40 },
    { nombre: "Kit Documentacion", sku: "PROD-002", precio: 125000, stock: 15 },
    { nombre: "Servicio Mensura", sku: "PROD-003", precio: 220000, stock: 7 },
  ];

  for (const producto of productos) {
    await prisma.producto.upsert({
      where: { sku: producto.sku },
      update: { nombre: producto.nombre, precio: producto.precio },
      create: producto,
    });
  }
};

seed()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed finalizado");
  })
  .catch(async (error) => {
    console.error("Error en seed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
