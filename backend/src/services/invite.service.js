const crypto = require("crypto");

const redis = require("../config/redis");

const logger = require("../common/libs/logger");


exports.createInvite = async (email, organizationId) => {

  const token = crypto.randomBytes(32).toString("hex");

  const payload = JSON.stringify({
    email,
    organizationId
  });

  await redis.set(`invite:${token}`, payload, {
    EX: 60 * 60 * 24
  });

  logger.info("Invite token created", {
    email,
    organizationId
  });

  return token;

};