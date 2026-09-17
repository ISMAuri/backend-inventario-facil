const User = require("../models/user.model");

class UserRepository {
  async findByEmail(email) {
    return User.findOne({
      where: {
        email,
      },
    });
  }

  async findById(id) {
    return User.findByPk(id, {
      attributes: {
        exclude: ["passwordHash"],
      },
    });
  }

  async create({ fullName, email, passwordHash, role }) {
    return User.create({
      fullName,
      email,
      passwordHash,
      role,
    });
  }

  async updateProfile(id, { fullName, email }) {
    await User.update(
      {
        fullName,
        email,
      },
      {
        where: {
          id,
        },
      },
    );

    return this.findById(id);
  }

  async updatePassword(id, passwordHash) {
    const [filasActualizadas] = await User.update(
      {
        passwordHash,
      },
      {
        where: {
          id,
        },
      },
    );

    return filasActualizadas > 0;
  }
}

module.exports = new UserRepository();
