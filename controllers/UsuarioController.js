const {Usuario} = require('../models');
const bcrypt = require('bcryptjs');
const servToken = require('../services/token');

module.exports={

    list : async (req, res, next) => {
        try {
            const re = await Usuario.findAll();
            res.status(200).json({re})
        } catch (error) {
            res.status(500).json({'error':'oops paso algo'})
            next()
        }
    },
    
    add : async (req, res, next) => {
        try{
            req.body.password = bcrypt.hashSync(req.body.password, 10);
            const user = await Usuario.create(req.body)
            res.status(200).json(user)
        } catch (error) {
            res.status(500)
        }
    },

    login : async (req, res, next) =>{
        try {
            const user = await Usuario.findOne({where:{email:req.body.email}});
            if(user){
                const contrasenavalida = bcrypt.compareSync(req.body.password, user.password)
                if(contrasenavalida){
                    const token = servToken.encode(user.id, user.rol)
                    res.status(200).send({
                        auth:true,
                        tokenReturn : token,
                        Usuario:user
                    })
                }else{
                    res.status(401).send({auth:false,tokenReturn: null,reason:
                    "Invalid password!"});
                }
            }else{
                res.status(404).json({'error':'usuario no existe'});
            }
        } catch (error) {
            res.status(500).json({'error':'oops paso algo'})
            next()
        }
    },

    update : async(req, res, next) => {

        try {
            const user = await Usuario.findOne({where : {email:req.body.email}})
            const validPassword = bcrypt.compareSync(req.body.password, user.password)
            const newEncriptedPassword = bcrypt.hashSync(req.body.newpassword)

            if(validPassword){
                const re = await Usuario.update({nombre : req.body.nombre, estado: req.body.estado, password: newEncriptedPassword})
                res.status(200).json(re)
            }else{

                res.status(401).send({auth: false, tokenReturn: null, reason: "Clave incorrecta"})

            }

        } catch  {
            res.status(500).json({'error':'oops paso algo'})
            next(error)
        }

    },

    activate : async (req,res,next)=>{
        try {
            const re = await Usuario.update({estado:1},{where:{id: req.body.id}});
            res.status(200).json(re);
        } catch (error) {
            res.status(500).json({'error':'oops paso algo'})
            next(error);
        }
    },
    deactivate : async (req,res,next) =>{
        try {
            const re = await Usuario.update({estado:0},{where:{id: req.body.id}});
            res.status(200).json(re);
        } catch (error) {
            res.status(500).json({'error':'oops paso algo'})
            next(error);
        }
    }
    
}