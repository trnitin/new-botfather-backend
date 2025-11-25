// import express from "express";
// import { MongoConnect } from "./utils/db.js";
// import cors from "cors";

// const app = express();
// const PORT = 3000;

// const corsOptions = {
//   origin: [
//     "http://newbotfather.s3-website.ap-south-1.amazonaws.com",
//     "https://zerodhalogin.netlify.app",
//     "http://botfather.co.in",
//     "https://botfather.co.in",
//     "http://localhost:5173",
//     "https://d292u4d54fm2cc.cloudfront.net",
//     "http://localhost:5174",
//   ],
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));
// app.use(express.json());

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "OPTIONS, GET, POST, PUT, PATCH, DELETE"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

// app.get("/", (req, res) => {
//   res.send("Hello, World!");
// });

// app.use((error, req, res, next) => {
//   const status = error.statusCode || 500;
//   console.error(error);
//   res.status(status).send(error);
// });

// // Start only after MongoDB connects
// async function startServer() {
//   try {
//     await MongoConnect();
//     app.listen(PORT, () =>
//       console.log(`✅ Server running at http://localhost:${PORT}`)
//     );
//   } catch (err) {
//     console.error("❌ MongoDB connection failed:", err);
//     process.exit(1);
//   }
// }

// startServer();

import express from "express";
import { MongoConnect } from "./utils/db.js";
import cors from "cors";
import cluster from "node:cluster";
import os from "node:os";
import process from "node:process";
import AllRoutes from "./routes/auth.js";

const PORT = 3000;
const totalCPUs = os.cpus().length;

const corsOptions = {
  origin: [
    "http://newbotfather.s3-website.ap-south-1.amazonaws.com",
    "https://zerodhalogin.netlify.app",
    "http://botfather.co.in",
    "https://botfather.co.in",
    "http://localhost:5173",
    "https://d292u4d54fm2cc.cloudfront.net",
    "http://localhost:5174",
  ],
  optionsSuccessStatus: 200,
};

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);
  console.log(`Number of CPUs: ${totalCPUs}`);

  // Fork workers (e.g., 2 or totalCPUs)
  for (let i = 0; i < 2; i++) cluster.fork();

  cluster.on("online", (worker) =>
    console.log(`Worker ${worker.process.pid} is online`)
  );

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Worker process
  const app = express();
  app.use(cors(corsOptions));
  app.use(express.json());

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });

  app.use(AllRoutes)
  // Example route
  app.get("/", (req, res) => {
    res.send(`Hello from worker ${process.pid}`);
  });

  app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    console.error(error);
    res.status(status).send(error);
  });

  // retries functionality instead of infinite process loop when db connection fails
//   async function startWorker() {
//   let retries = 5;

//   while (retries) {
//     try {
//       await MongoConnect();
//       console.log(`Worker ${process.pid} connected to MongoDB`);
      
//       app.listen(PORT, () =>
//         console.log(`Worker ${process.pid} listening on port ${PORT}`)
//       );

//       return; // success → stop retrying
//     } catch (err) {
//       retries--;
//       console.error(`MongoDB connection failed. Retries left: ${retries}`, err);
//       await new Promise((res) => setTimeout(res, 3000)); // wait 3 sec
//     }
//   }

//   console.error("MongoDB connection permanently failed. Shutting down worker.");
//   process.exit(1);
// }


  // Async start: connect to MongoDB first
  async function startWorker() {
    try {
      await MongoConnect(); // ensures DB is ready
      app.listen(PORT, () =>
        console.log(`Worker ${process.pid} listening on port ${PORT}`)
      );
    } catch (err) {
      console.error("MongoDB connection failed:", err);
      process.exit(1);
    }
  }

  startWorker();
}

