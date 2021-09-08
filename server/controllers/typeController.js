const {Type} = require('../models/models');
const ApiError = require('../error/ApiError');

class TypeController {
  async getAll(request, response) {
    const types = await Type.findAll();
    return response.json(types);
  }

  async create(request, response) {
    const {name} = request.body;
    const type = await Type.create({name});
    return response.json(type);
  }
}

module.exports = new TypeController();