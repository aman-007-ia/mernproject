const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },

    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },

    phone: {
        type: Number,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    password: { type: String, required: true },
    confirmpassword: { type: String, required: true },
    tokens: [{
        token: {
            type: String,
            required: true,
        },
    }, ],
});

// generating tokens
employeeSchema.methods.generateAuthToken = async function() {
    try {
        console.log(this._id);
        const token = jwt.sign({ _id: this._id.toString() },
            process.env.SECRET_KEY
        );
        // console.log(token);
        this.tokens = this.tokens.concat({ token: token });
        // console.log(token);
        await this.save();
        console.log(token);
        return token;
    } catch (err) {
        res.send("the error part " + err);
        console.log("the error part" + err);
    }
};

// converting password into hash
employeeSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);

        this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
});

const Register = new mongoose.model("Register", employeeSchema);
module.exports = Register;