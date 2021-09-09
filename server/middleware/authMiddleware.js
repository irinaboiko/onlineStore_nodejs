const { verify } = require("jsonwebtoken");

module.exports = function (request, response, next) {
  if (request.method === "OPTIONS") {
    next();
  }
  try {
    const token = request.headers.authorization.split(" ")[1];
    if (!token) {
      return response
        .status(401)
        .json({ message: "Пользователь не авторизован" });
    }
    const decodedToken = verify(token, process.env.SECRET_KEY);
    request.user = decodedToken;
    next();
  } catch (error) {
    response.status(401).json({ message: "Пользователь не авторизован" });
  }
};
