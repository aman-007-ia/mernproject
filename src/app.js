require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
require("./db/conn");
const Register = require("./models/registers");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

// const { json } = require("express");
const { log } = require("console");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
    res.render("index");
});
app.get("/secret", auth, (req, res) => {
    // console.log(`the is the cookie awesome ${req.cookies.jwt}`);

    res.render("secret");
});
app.get("/logout", auth, async(req, res) => {
    try {
        console.log(req.user);

        req.user.tokens = req.user.tokens.filter((currElement) => {
            return currElement.token !== req.token;
        });

        res.clearCookie("jwt");
        console.log("logout successfully");
        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
});
app.get("/logoutall", auth, async(req, res) => {
    try {
        console.log(req.user);

        // logout from all devices
        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("logout successfully");
        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

// create a new user in our database
app.post("/register", async(req, res) => {
    try {
        console.log("password=>", req.body.password);
        console.log("confirm PASSOWRD=>", req.body.confirmpassword);
        if (req.body.password === req.body.confirmpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                age: req.body.age,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
            });

            console.log("the success part " + registerEmployee);

            const token = await registerEmployee.generateAuthToken();
            console.log("the token part " + token);

            // The res.cookie() function is used to set the cookie name to value.
            // The value parameter may be a string or object converted to JSON.
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true,
            });
            console.log(cookie);

            const registered = await registerEmployee.save();
            console.log("the page part" + registered);

            res.status(201).render("index");
        } else {
            res.send("password are not matching");
        }
    } catch (e) {
        res.status(400).send(e);
        console.log("the error part page");
    }
});

//

app.post("/login", async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, useremail.password);
        const token = await useremail.generateAuthToken();
        console.log("the token part" + token);
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 500000),
            httpOnly: true,
            // secure: true,
        });
        // console.log(isMatch);

        if (isMatch) {
            res.status(201).render("index");
        } else {
            res.send("invalid login Details");
        }
    } catch (error) {
        res.status(400).send("invalid login Details");
    }
});

// const securePassword = async(password) => {
//     const passwordHash = await bcrypt.hash(password, 10);
//     console.log(passwordHash);

//     const passwordmatch = await bcrypt.compare("thapa@13", passwordHash);
//     console.log(passwordmatch);
// };

// securePassword("thapa@123");

// const createToken = async() => {
//     const token = await jwt.sign({ _id: "6320c1dea5f5d880f903e774" },
//         "mynameisamanyadaviamsoftwareengnieer"
//     );
//     console.log(token);

//     const userVer = await jwt.verify(
//         token,
//         "mynameisamanyadaviamsoftwareengnieer"
//     );
//     console.log(userVer);
// };

// createToken();

app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
});