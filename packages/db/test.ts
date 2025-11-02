import { prisma } from "./index";

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    // test queries
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}.`);

    // test create
    const newUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
      },
    });
    console.log("✅ Created test user:", newUser.email);

    // test read
    const fetchedUser = await prisma.user.findUnique({
      where: { id: newUser.id },
    });
    console.log("Fetched user:", fetchedUser);

    // cleanup
    await prisma.user.delete({
      where: { id: newUser.id },
    });
    console.log("🧹 Cleaned up test user");

    console.log("🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
