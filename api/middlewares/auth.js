import { sendResponse } from "../utils/helpers";

const apiGuard = (req, res, next, allowedRoles) => {
  const user = req.session.user;
  if (!user) {
    return sendResponse(res, null, "Unauthorized", 401);
  }

  if (!allowedRoles.includes(user.role)) {
    return sendResponse(res, null, "Forbidden", 403);
  }

  next();
};

export { apiGuard };
