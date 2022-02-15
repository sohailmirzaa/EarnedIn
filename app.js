//jshint esversion:6
const { request } = require("express");
const express = require("express");
const bodyParser = require("body-parser");
const md5 = require("md5");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const app = express();
app.use(express());

app.use("/public", express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "our little secrete",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
//EarnedIn
mongoose.connect(
  "mongodb+srv://sohailmirza:devilm53@cluster0.0bhsp.mongodb.net/EarnedIn",
  {
    useNewUrlParser: true,
  }
);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration:String,
  wages:String,
  place:String,
});
// const searchedItems;

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
const Job = new mongoose.model("Job", jobSchema);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("Home");
});

app.post("/", (req, res) => {
   const searchItemEjs=req.body.searchItem;
    console.log(searchItemEjs);
    Job.findOne({ "title": {searchItemEjs} }, function (err, searchItem) {
      console.log(searchItem);
      res.redirect("/jobs");
    });
});

app.get("/login", (req, res) => {
  res.render("Login");
});
app.get("/register", (req, res) => {
  res.render("Register");
});
app.get("/jobs", (req, res) => {
     Job.find({},function(err,jobs){
      res.render("Jobs", {
     
        // title: jobData.title,
        // description: jobData.description,
        // location: jobData.location,
        // duration: jobData.duration,
        // wages: jobData.wages,
        JobList:jobs
      });
      
     })


});

app.get("/postwork", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("postwork");
  } else {
    res.redirect("/login");
  }
});

app.post('/postwork', (req, res) => {
  const job = new Job({
    title: req.body.jobtitle,
    description: req.body.description,
    place: req.body.location,
    duration: req.body.duration,
    wages: req.body.wages,
  }); 
  job.save()
  res.redirect("/jobs")
  
});

app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        res.redirect("/register");
      }
      else {
        passport.authenticate("local")(req, res, function () {
          res.render("postwork");
        });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/postwork");
      });
    }
  });
});

// const username = req.body.username;
// const password = req.body.password;
// console.log(username);
// console.log(password);

app.get("/logout", (req, res) => {
  req.logOut();
  res.render("home");
});

app.listen(3000, () => {
  console.log(`Server started on port`);
});
