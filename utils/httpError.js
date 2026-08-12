/**
 * BUG-046: HTTP error helper — đảm bảo lỗi authorization trả đúng status (403/404...)
 * thay vì 500 mặc định khi throw plain Error.
 */
const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

module.exports = { httpError };
