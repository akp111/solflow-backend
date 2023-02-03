const router = require("express").Router();
const Hello = require("../controllers/index").Hello
// router.get("/", Hello.sayHello);
router.post("/", Hello.Register)
router.post("/pending", Hello.getPendingPayments)
module.exports = router