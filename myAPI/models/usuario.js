'use strict';


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// crear un esquema

const usuarioSchema = mongoose.Schema({
    email: {type: String, unique: true },
    password: String,
});

usuarioSchema.statics.hashPassword = function(plainPassword) {
    return bcrypt.hash(plainPassword, 10);

}

const Usuario = mongoose.model('Usuario', usuarioSchema);




//exportamos el modelo
module.exports = Usuario;


