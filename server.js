if(process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

const express = require("express")
const app = express();
const expressLayout = require("express-ejs-layouts")
const ejs = require("ejs");
const methodOverride = require("method-override");


app.set("view engine", "ejs")
app.set("views", __dirname + "/views")
app.set("layout", "layouts/layout")
app.use(expressLayout)
app.use(methodOverride("_method"));
app.use(express.static("public"))
app.use(express.urlencoded({ limit: "10mb", extended: false }))


//DATABASE CONNECTION
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on("error", error => console.error(error))
db.once("open", () => console.log("Connected To Database"))

//Route Handlers
app.use("/", require("./routes/index"));
app.use("/authors", require("./routes/authors"));
app.use("/books", require("./routes/books"));


const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log("Server Running"));
