const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/newtask", { useNewUrlParser: true, useUnifiedTopology: true },

)

const userSchema = new mongoose.Schema({
    name: String,
    firstName: String,
    lastName: String,
    role: {
        type: String,
        enum: ["supplier", "agent"],
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"]
    },
    createdBy: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: String,
    updatedAt: {
        type: Date,
        default: Date.now
    },
    date: Date,
    email: String,
    password: String,
    is_varified : {
        type : Number ,
        default : 0
    }

})

const User = new mongoose.model("users_datas", userSchema);

app.listen(5010, () => {
    console.log("Listening to MongoDB on port 5010")
})

module.exports = User;