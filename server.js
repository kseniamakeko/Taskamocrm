const cors_proxy = require("cors-anywhere");

const host = "0.0.0.0";
const port = 8080;

cors_proxy
  .createServer({
    originWhitelist: [],
    requireHeader: [],
  })
  .listen(port, host, function () {
    console.log("CORS Anywhere запущен на http://" + host + ":" + port);
  });
