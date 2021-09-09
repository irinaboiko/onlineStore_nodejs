const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");

const { User, Cart } = require("../models/models");
const ApiError = require("../error/ApiError");

const generateJwtToken = (id, email, role) => {
  return sign({ id, email, role }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
};

class UserController {
  async registration(request, response, next) {
    const { email, password, role } = request.body;
    if (!email || !password) {
      return next(ApiError.badRequest("Некорректный email или password"));
    }

    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      return next(
        ApiError.badRequest("Пользователь с таким email уже существует")
      );
    }

    const hashPassword = await bcrypt.hash(password, 5);
    const user = await User.create({ email, role, password: hashPassword });
    const cart = await Cart.create({ userId: user.id });
    const token = generateJwtToken(user.id, user.email, user.role);
    return response.json(token);
  }

  async login(request, response, next) {
    const { email, password } = request.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(ApiError.internal("Пользователь не найден"));
    }

    let comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return next(ApiError.internal("Неверный пароль"));
    }

    const token = generateJwtToken(user.id, user.email, user.role);
    return response.json(token);
  }

  async check(request, response, next) {
    const token = generateJwtToken(
      request.user.id,
      request.user.email,
      request.user.role
    );
    return response.json({ token });
  }
}

module.exports = new UserController();
