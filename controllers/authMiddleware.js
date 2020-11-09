const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers["user-token"];
    if (!token) {
      return res.status(403).json({ Error: "Unauthorized User" });
    }
    const decoded = await jwt.verify(token, config.SECRET_KEY);
    req.user = decoded.user;

    next();
  } catch (err) {
    res.status(500).json({ Error: "Unable to Authenticate User" });
  }
};
