const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { addUser, findUser } = require("./users");
const mongoose = require('mongoose');
require('dotenv').config();
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3001;
const mongoURI = process.env.MONGO_URI;

// MongoDB connection configuration
// const username = encodeURIComponent(process.env.MONGO_USERNAME);
// const password = encodeURIComponent(process.env.MONGO_PASSWORD);
// const cluster = process.env.MONGO_CLUSTER;
// const authSource = process.env.MONGO_AUTH_SOURCE || 'admin'; // Default to 'admin'
// const authMechanism = process.env.MONGO_AUTH_MECHANISM || 'SCRAM-SHA-256'; // Default mechanism

// const uri = `mongodb+srv://${username}:${password}@${cluster}/?authSource=${authSource}&authMechanism=${authMechanism}`;

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Connection error:', err));


app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

//EJS template

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

//Routes

app.get("/login", (req, res) => {
  const error = req.query.error || "";
  // res.render("login", { error }); ejs file render
  res.sendFile(path.join(__dirname,'public','login.html'))
});

app.post("/login", async (req, res) => {
  const { username,email, password } = req.body;
  try{
  const user = await findUser(email);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = { email: user.email };
    res.redirect("/home");
  } else {
    res.redirect('Invalid email or Password');
    }
  }
  catch(error){
    console.error('error occured ',error)
    res.status(500).send('Internal server error')
  }
});

//sign up section

app.get("/signup", (req, res) => {
  const error = req.query.error || "";
  // res.render("signup", { error }); ejs file
  res.sendFile(path.join(__dirname,'public','signup.html'))
});

app.post("/signup", async (req, res) => {
  const { firstname,lastname,username,email,password } = req.body;
  try{
    const existingUser =await findUser(email);
  if (existingUser) {
    return res.status(400).send('/signup?error=User already exists');
  }
    await addUser(firstname,lastname,username,email,password)
    res.redirect("/login");
  } catch (error){
    console.error('Error during signup',error)
    res.status(500).send('internal server error')
  }
});

app.get("/home", (req, res) => {
  if (req.session.user) {
    // res.render("home");
    res.sendFile(path.join(__dirname,'public','home.html'))
  } else {
    res.redirect("/login");
  }
});
app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("Internal Error");
    }
  
    res.redirect("/login");
  });
});

app.listen(port, () => {
  console.log("server running on port:", port);
});
