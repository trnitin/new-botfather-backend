import mongodb from "mongodb";
import { getDB } from "../utils/db.js";

export default class Set {
  constructor(email, primary, name) {
    this.email = email;
    this.primary = primary;
    this.name = name;
  }

  save() {
    const db = getDB();
    console.log(this, "this");
    return db
      .collection("set")
      .insertOne(this)
      .then((result) => result)
      .catch((err) => console.log(err));
  }

  static getSet(name) {
    const db = getDB();
    return db
      .collection("set")
      .findOne({ name })
      .then((user) => user)
      .catch((err) => console.log(err));
  }

  static deleteCollection(name) {
    const db = getDB();
    return db
      .collection("set")
      .deleteOne(name)
      .then((user) => user)
      .catch((err) => console.log(err));
  }

  static findById(userId) {
    const db = getDB();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userId) })
      .then((user) => user)
      .catch((err) => console.log(err));
  }

  static getAllSets() {
    const db = getDB();
    console.log("in users");
    return db
      .collection("set")
      .find()
      .toArray()
      .then((user) => user)
      .catch((err) => console.log(err));
  }

  static findByEmailId(email) {
    const db = getDB();
    return db
      .collection("users")
      .findOne({ email })
      .then((user) => user)
      .catch((err) => console.log(err));
  }

  static findByIdAndUpdate(email) {
    const db = getDB();
    return db
      .collection("users")
      .updateOne({ email }, { $set: { updated_at: Date.now() } })
      .then((user) => user)
      .catch((err) => console.log(err));
  }

  static findByIdAndUpdateToken(userId, val) {
    console.log(userId, val, "inside Model");
    const db = getDB();
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(userId) },
        { $set: { access_token: val, updated_at: Date.now() } }
      )
      .then((user) => user)
      .catch((err) => console.log(err));
  }

  static findByIdAndUpdateFSToken(email, val) {
    console.log(email, val, "inside Model");
    const db = getDB();
    return db
      .collection("users")
      .updateOne(
        { email },
        { $set: { FS_access_token: val, updated_at: Date.now() } }
      )
      .then((user) => user)
      .catch((err) => console.log(err));
  }

  static getUsers() {
    const db = getDB();
    console.log("in users");
    return db
      .collection("users")
      .find()
      .toArray()
      .then((user) =>
        user
          .sort((a, b) => b.updated_at - a.updated_at)
          .map((ele) => ({
            email: ele?.email,
            name: ele?.name,
            updated: ele?.updated_at,
          }))
      )
      .catch((err) => console.log(err));
  }
}
