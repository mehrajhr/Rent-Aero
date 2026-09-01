import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";


const port = config.port;


async function main() {
  try {
    console.log("server starting ...")
    await prisma.$connect();
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log("Error starting the server", error);
    prisma.$disconnect();
    process.exit(1);
  }
}

main();
