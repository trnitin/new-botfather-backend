import { createRequire } from "module";
const require = createRequire(import.meta.url); // allow require in ESM
const TOTP = require("totp-generator").TOTP;     // old working CJS class

import User from "../model/user.js";
import Set from "../model/set.js";
import Firstock from "thefirstock";

const firstock = new Firstock();

export const set_loginAll = async (req, res, next) => {
  const { name } = req.body;

  try {
    const resp = await Set.getSet(name);
    if (!resp) throw Object.assign(new Error("No such set"), { statusCode: 403 });

    const emails = resp.email || [];
    const successUsers = [];
    const failedUsers = [];

    await Promise.all(
      emails.map(async (email) => {
        try {
          const user = await User.findByEmailId(email);
          if (!user) return;

          const otp = TOTP.generate(user.FS_TOTPKEY); // ✅ exactly like old code
          console.log(user.FS_TOTPKEY, otp.otp, "otp");
          const loginData = {
            userId: user.FS_uid,
            password: user.FS_Pass,
            TOTP: otp?.otp,
            vendorCode: user.FS_id,
            apiKey: user.FS_api_key,
          };

          const result = await new Promise((resolve, reject) =>
            firstock.login(loginData, (err, res) => (err ? reject(err) : resolve(res)))
          );

          if (result?.data?.susertoken) {
            const update = await User.findByIdAndUpdateFSToken(
              result.data.email.toLowerCase(),
              result.data.susertoken
            );
            if (update?.acknowledged) successUsers.push(email);
          } else {
            failedUsers.push({ email, message: result?.message || "Unknown error" });
          }
        } catch (err) {
          failedUsers.push({ email, message: err?.detail || err?.message || "Unknown error" });
        }
      })
    );

    res.status(200).json({
      message: `${successUsers.length} users logged in`,
      successUsers,
      failedUsers,
    });
    console.log("Successful logins:", successUsers);
    console.log("Failed logins:", failedUsers);
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
