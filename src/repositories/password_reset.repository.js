const sequelize = require("../config/database");
const PasswordResetOtp = require("../models/password_reset_otp.model");
const User = require("../models/user.model");

class PasswordResetRepository {
  async create({ userId, recoveryHash, otpHash, expiresAt }) {
    return PasswordResetOtp.create({
      userId,
      recoveryHash,
      otpHash,
      expiresAt,
    });
  }

  async findByRecoveryHash(recoveryHash) {
    return PasswordResetOtp.findOne({
      where: { recoveryHash },
    });
  }

  async invalidateActiveForUser(userId) {
    await PasswordResetOtp.update(
      {
        usedAt: new Date(),
      },
      {
        where: {
          userId,
          usedAt: null,
        },
      },
    );
  }

  async invalidateByRecoveryHash(recoveryHash) {
    await PasswordResetOtp.update(
      {
        usedAt: new Date(),
      },
      {
        where: {
          recoveryHash,
          usedAt: null,
        },
      },
    );
  }

  async incrementAttempts(id) {
    await PasswordResetOtp.increment("attempts", {
      by: 1,
      where: { id },
    });
  }

  async markVerified(id) {
    await PasswordResetOtp.update(
      {
        verifiedAt: new Date(),
      },
      {
        where: {
          id,
          usedAt: null,
        },
      },
    );
  }

  async resetPasswordAtomically({ recoveryHash, passwordHash }) {
    return sequelize.transaction(async (transaction) => {
      const solicitud = await PasswordResetOtp.findOne({
        where: { recoveryHash },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!solicitud) {
        return false;
      }

      const ahora = new Date();

      if (
        solicitud.usedAt ||
        !solicitud.verifiedAt ||
        new Date(solicitud.expiresAt) <= ahora
      ) {
        return false;
      }

      const [actualizados] = await User.update(
        {
          passwordHash,
        },
        {
          where: {
            id: solicitud.userId,
          },
          transaction,
        },
      );

      if (actualizados === 0) {
        return false;
      }

      solicitud.usedAt = ahora;

      await solicitud.save({
        transaction,
      });

      return true;
    });
  }
}

module.exports = new PasswordResetRepository();
