import prisma from "../lib/prisma";

async function main() {
  // Clear existing database tables in correct dependency order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleared successfully.");

  // 1. Create Core Categories
  const accessories = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
    },
  });

  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
      slug: "electronics",
    },
  });

  const lifestyle = await prisma.category.create({
    data: {
      name: "Lifestyle",
      slug: "lifestyle",
    },
  });

  console.log("Categories seeded: Accessories, Electronics, Lifestyle.");

  // 2. Create Role-Based Core Users
  // In Module 3, passwords will be hashed using bcrypt before seeding
  const admin = await prisma.user.create({
    data: {
      name: "Shop Administrator",
      email: "admin@eshop.com",
      role: "ADMIN",
      address: "Admin HQ, Suite 101, Vercel Edge City",
      phone: "1-800-555-ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      role: "CUSTOMER",
      address: "123 Main Street, New York, NY 10001",
      phone: "+1 (555) 123-4567",
    },
  });

  console.log("Users seeded: Admin (admin@eshop.com), Customer (john@example.com).");

  // 3. Create High-Fidelity Catalog Products
  const productsData = [
    {
      name: "Solitude Glass Chronograph",
      slug: "solitude-glass-chronograph",
      description: "An elegant mechanical watch featuring premium sapphire crystal, custom automatic movement, and a handstitched Horween leather strap. A timeless statement piece of modern craftsmanship.",
      price: 249.00,
      stock: 5,
      images: ["⌚"],
      categoryId: accessories.id,
      isActive: true,
    },
    {
      name: "Frosted Cybernetic Headphones",
      slug: "frosted-cybernetic-headphones",
      description: "Wireless over-ear headphones built using lightweight aluminum grids and frosted glass earcups. Features advanced active noise cancellation, custom audio drivers, and 40-hour battery runtime.",
      price: 189.00,
      stock: 12,
      images: ["🎧"],
      categoryId: electronics.id,
      isActive: true,
    },
    {
      name: "Indigo Glassmorphic Keycaps",
      slug: "indigo-glassmorphic-keycaps",
      description: "Frosted semi-transparent mechanical keyboard keycap set in custom cherry profile. Optimized for glowing RGB configurations to create an ultra-premium typing backdrop.",
      price: 79.00,
      stock: 0, // Out of stock by default to verify low-stock/unavailability UI overlays
      images: ["⌨️"],
      categoryId: electronics.id,
      isActive: true,
    },
    {
      name: "Minimalist Leather Cardholder",
      slug: "minimalist-leather-cardholder",
      description: "Handcrafted full-grain leather wallet engineered to slide smoothly into front pockets. Compact design secures up to 8 cards and standard folded cash with built-in RFID blocking shield.",
      price: 45.00,
      stock: 20,
      images: ["💼"],
      categoryId: lifestyle.id,
      isActive: true,
    },
  ];

  for (const product of productsData) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log("Products seeded successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seeding process completed cleanly.");
  })
  .catch(async (e) => {
    console.error("Error occurred during database seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
