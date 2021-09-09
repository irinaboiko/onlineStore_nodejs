const uuid = require("uuid");
const path = require("path");
const { Device, DeviceInfo } = require("../models/models");
const ApiError = require("../error/ApiError");

class DeviceController {
  async getAll(request, response) {
    let { brandId, typeId, limit, page } = request.query;
    page = page || 1;
    limit = limit || 3;
    let offset = page * limit - limit;
    let devices;
    if (!brandId && !typeId) {
      devices = await Device.findAndCountAll({ limit, offset });
    }
    if (brandId && !typeId) {
      devices = await Device.findAndCountAll({
        where: { brandId },
        limit,
        offset,
      });
    }
    if (!brandId && typeId) {
      devices = await Device.findAndCountAll({
        where: { typeId },
        limit,
        offset,
      });
    }
    if (brandId && typeId) {
      devices = await Device.findAndCountAll({
        where: { brandId, typeId },
        limit,
        offset,
      });
    }
    return response.json(devices);
  }

  async getOne(request, response) {
    const { id } = request.params;
    const device = await Device.findOne({
      where: { id },
      include: [{ model: DeviceInfo, as: "info" }],
    });
    return response.json(device);
  }

  async create(request, response, next) {
    try {
      let { name, price, brandId, typeId, info } = request.body;
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

      if (info) {
        info = JSON.parse(info);
        info.forEach((infoItem) =>
          DeviceInfo.create({
            title: infoItem.title,
            description: infoItem.description,
            deviceId: device.id,
          })
        );
      }

      return response.json(device);
    } catch (error) {
      next(ApiError.badRequest(error.message));
    }
  }
}

module.exports = new DeviceController();
