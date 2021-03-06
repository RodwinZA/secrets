require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost/userDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.post("/register", (req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if (err){
            console.error(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res.redirect, () => {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err){
            console.error(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    })
});


app.listen(3000, () => {
    console.log("Server listening on port 3000");
});