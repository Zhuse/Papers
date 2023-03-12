exports.successResponse = function (res, msg) {
  const data = {
    message: msg,
  };
  return res.status(200).json(data);
};

exports.successResponseWithData = function (res, msg, data) {
  const resData = {
    message: msg,
    data,
  };
  return res.status(200).json(resData);
};

exports.errorResponse = function (res, msg) {
  const data = {
    message: msg,
  };
  return res.status(500).json(data);
};

exports.notFoundResponse = function (res, msg) {
  const data = {
    message: msg,
  };
  return res.status(404).json(data);
};

exports.validationErrorWithData = function (res, msg, data) {
  const resData = {
    message: msg,
    data,
  };
  return res.status(400).json(resData);
};

exports.unauthorizedResponse = function (res, msg) {
  const data = {
    message: msg,
  };
  return res.status(401).json(data);
};
