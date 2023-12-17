import RedisClient from "../config/redisClient";
import * as UserModels from "../models/users";

export async function verify(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (token) {
      let isExist = await RedisClient.hExists("users", token.toString());
      if (isExist) {
        let isUser = await RedisClient.hGet("users", token.toString());
        const user = await UserModels.findByEmail(isUser);
        res.locals._id = user._id;
        res.locals.email = user.email;
        if (user.name) {
          res.locals.name = user.name;
        }
        return await next();
      } else {
        return res.unauthorizedUser();
      }
    } else {
      return res.unauthorizedUser();
    }
  } catch (e) {
    if (/invalid token/i.test(e)) return res.unauthorizedUser();
    return res.error(e);
  }
}
