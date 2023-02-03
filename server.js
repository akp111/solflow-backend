require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const initialiseRoutes = require("./routes/index").default
// const initialiseDBConnection = require("./loaders/index").default
//middleware
app.use(express.json());
app.use(cors());
initialiseRoutes(app);
app.get("/",(req,res)=>{
  res.sendStatus(200)

})
// servers starts listening
app.listen(4000, () => {
  console.log("Server started at 4000");
});