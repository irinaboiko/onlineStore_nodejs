const uuid = require("uuid");
const path = require("path");
const { Device } = require("../models/models");
const ApiError = require("../error/ApiError");

class DeviceController {
  async getAll(request, response) {
    const { brandId, typeId } = request.query;
    let devices;
    if (!brandId && !typeId) {
      devices = await Device.findAll();
    }
    if (brandId && !typeId) {
      devices = await Device.findAll({where:{brandId}});
    }
    if (!brandId && typeId) {
      devices = await Device.findAll({where:{typeId}});
    }
    if (brandId && typeId) {
      devices = await Device.findAll({where:{brandId, typeId}});
    }
    return response.json(devices);
  }

  async getOne(request, response) {}

  async create(request, response, next) {
    try {
      const { name, price, brandId, typeId, info } = request.body;
      const { img } = request.files;
      let fileName = `${uuid.v4()}.jpg`;
      img.mv(path.resolve(__dirname, "..", "static", fileName));

      const device = await Device.create({
        name,
        price,
        brandId,
        typeId,
        info,
        img: fileName,
      });

      return response.json(device);
    } catch (error) {
      next(ApiError.badRequest(error.message));
    }
  }
}

module.exports = new DeviceController();
