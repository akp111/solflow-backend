const HelloRoute = require("./Hello")

function initialiseRoutes(app){

   app.use("/hello", HelloRoute);
}
exports.default = initialiseRoutes;