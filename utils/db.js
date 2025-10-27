// // const MongoClient = mongodb.MongoClient;
// import { MongoClient } from "mongodb";

// let _db;

//  const MongoConnect = async (callback) => {
//   MongoClient.connect(
//     "mongodb+srv://nitin:nitin@cluster0.kbnly1e.mongodb.net",
//      {
//   tls: true,
//   tlsAllowInvalidCertificates: false, // only for testing
//   serverSelectionTimeoutMS: 10000,
// }
//   )
//     .then((client) => {
//       _db = client.db("Trial");
//       callback();
//     })
//     .catch((err) => {
//       throw err;
//     });
// };


// const getDB = () => {
//   if (_db) {
//     return _db;
//   }
//   throw "no DB found";
// };

// export {MongoConnect , getDB};
// // exports.getDB = getDB;

import { MongoClient } from "mongodb";

let _db;

export async function MongoConnect() {
  const client = await MongoClient.connect(
    "mongodb+srv://nitin:nitin@cluster0.kbnly1e.mongodb.net/Trial",
    {
      tls: true,
      serverSelectionTimeoutMS: 10000,
    }
  );
  _db = client.db("Trial");
  console.log("✅ Connected to MongoDB");
}

export function getDB() {
  if (!_db) throw new Error("no DB found");
  return _db;
}
