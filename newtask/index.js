const http = require('http');
const express = require('express');
const { urlencoded } = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const User = require('./database')
const nodemailer = require('nodemailer')


const app = express();
const server = http.createServer(app);
const port = 3000;


app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(cookieParser())



app.post('/userLogin', async (req, res) => {
    const data = req.body;
    let user_password = data.password;
    let user_email = data.email;
    const user_data = await User.findOne({ email: user_email })
    if (!user_data) {
        res.status(400);
        return res.send("incorrect gmail");

    }
    let db_password = user_data.password;
    //matching password
    const isValid = await bcrypt.compare(user_password.toString(), db_password);

    //taking action for incorrect password
    if (!isValid) {
        res.status(400)
        return res.send("incorrect gmail");
    }

    //generate token
    const token_to_send = jwt.sign({ id: user_data._id }, "mySecretKey", { expiresIn: '5s' })
    res.cookie('my_token', token_to_send);
    res.send("login successfull")
})

// for send mail

const sendVerifyMail = async(name , email , user_id) => {
    try {
       const transporter =  nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
              user: "nathaniel.wintheiser21@ethereal.email", 
              pass: "XZDBNfGxrKXZ36k4uN",
            },
        })

        const mailOption = {
            form : "nathaniel.wintheiser21@ethereal.email",
            to : email ,
            subject : "for verification mail",
            html : `<p>Hii ${name} , please click here to <a href="http://127.0.0.1:3000/verify?id=${user_id}"> verify </a> your mail. </p>`
        }
        transporter.sendMail(mailOption , (err , info) => {
            if(err) {
                console.log(err.message)
            }
            else{
                console.log("email has been send :-", info.response)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

app.post('/userSignup', async (req, res) => {
    const data = req.body;
    let user_name = data.name;
    let user_email = data.email;
    let user_password = data.password;
    let user_firstName = data.firstName;
    let user_lastName = data.lastName;
    let user_status = data.status;
    let user_role = data.role;
    let user_createdBy = data.createdBy;
    let user_updatedBy = data.updatedBy;
    if (data.password !== data.cpassword) {
        return res.send("Incorrect Password");
    }
    if (!user_name || !user_email || !user_password || !user_createdBy || !user_firstName || !user_lastName || !user_role || !user_status || !user_updatedBy) {
        res.status(400)
        return res.send("Fields are empty")
    }
    const user_data = await User.findOne({ email: user_email })
    if (user_data) {
        res.status(400);
        return res.send("User already exists");
    }
    const salt = await bcrypt.genSalt(10)
    let hashed_password = await bcrypt.hash(user_password.toString(), salt)
    const data_to_store = new User({ name: user_name, email: user_email, password: hashed_password , firstName : user_firstName , lastName : user_lastName , role : user_role , status : user_status , createdBy : user_createdBy , updatedBy : user_updatedBy })
    const userData = await data_to_store.save()
    // res.redirect('/login')

    if(userData) {
        sendVerifyMail(data.name , data.email , userData._id)
        res.send("submited successfully , please verify your email")

    }

})


const verifyMail = async (req,res) => {
    try {
        
        const updateInfo = await User.updateOne({_id:req.query.id} , { $set:{ is_varified:1 } })
        
        console.log(updateInfo)
        res.send("email verify")
        
    } catch (error) {
        console.log(error.message)   
    }
}

app.get("/verify" , verifyMail , (req,res) => {
    res.send("email verified")
})

server.listen(port, () => {
    console.log('server started at', port)
})