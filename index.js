require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({origin: "*"}));
const port = 3000;
const bodyParser = require('body-parser');
const connection = require("./database/connection");
const Usuarios = require("./database/Usuarios");
const generateToken = (id) => {
    return jwt.sign({id},process.env.KEY)
}
const decriptToken = (token) => {
    return jwt.verify(token,process.env.KEY,(error, decoded)=>{return decoded})
}
const checkToken = async (token) => {
    var decript = await decriptToken(token)
    return decript.id != undefined ? decript.id : false
}

connection.
        authenticate()
        .then(()=>{
            console.log("Database connected")
        })
        .catch((error) => {
            console.log(error)
        });

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post("/login", async (req,res) => {
    var email = req.body.email;
    var password = req.body.password;
    var user = await Usuarios.findOne({where: {email: email, password: password},raw: true})
    if(user != null){
        res.send({status:generateToken(user.id)})
    }else{
        res.send({status: false})
    }
});

app.post("/cadastrar", async (req,res) => {
    var email = req.body.email;
    var nome = req.body.nome;
    var password = req.body.password;
    var check = await Usuarios.findOne({where: {email: email}});
    if (check == null){
        await Usuarios.create({
            email: email,
            nome: nome,
            password: password
        });
        var user = await Usuarios.findOne({where: {email, password},raw: true})
        res.send({status:generateToken(user.id)})
    }else{
        res.send({status: false});
    }
});

app.get("/", (req,res) => {
    res.send("Yes sir")
});

app.listen(process.env.PORT || port,(req, res) => {
    console.log("Server started")
});