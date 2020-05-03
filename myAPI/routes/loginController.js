'use strict';

const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken'); 



class LoginController {


  /* Peticion get a /login */
  index(req, res, next) {
    res.locals.email = ''; /* con esto le estamos añadiendo la variable de la vista email */
    res.locals.error = '';
    res.render('login.html');

  }


  /**Peticion post a /login  */

  async post(req, res, next) {
    try {
      // recoger los parametros de entrada
      const email = req.body.email;
      const password = req.body.password;

      // buscar el usuario en la base de datos

      const usuario = await Usuario.findOne({ email: email });

      // si no existe el usuario o la password no coincide

      // if (!usuario || usuario.password !== password) { sin cifrar
      if (!usuario || !await bcrypt.compare(password, usuario.password)) { //cifrada 
        console.log(email, password);
        res.locals.email = email; /* le devolvemos a la pagina el mail para no tener que ponerlo */
        res.locals.error = ('Invalid credentials');
        res.render('login');
        return;

      }

      // encuentro el usuario y la password es correcta


      //apuntar el id de usuario en la sesion del usuario. 
      // el req.session es donde se almancena la informacion del
      // express-session
      req.session.authUser = { /*llamamos al atributo como queramos */
        _id: usuario._id

      };
      console.log('pasa por aqui*********************', req.session.authUser);
      res.redirect('/private');
    } catch (err) {
      next(err);
    }
  }

  /* GET / logaut */

  logout(req, res, next) {
    req.session.regenerate(err => { //esto es un metodo expecifico de express-session para borrar la sesion */
      if (err) {
        next(err); /* si hay error */
        return;
      }

      res.redirect('/');

    })
  }

/* POST /api/authenticate */

  async postJWT(req, res, next) {
    try {
      // recoger los parametros de entrada
      const email = req.body.email;
      const password = req.body.password;

      console.log(email);
      console.log(password);

      // buscar el usuario en la base de datos

      const usuario = await Usuario.findOne({ email: email });

      // si no existe el usuario o la password no coincide

      // if (!usuario || usuario.password !== password) { sin cifrar
      if (!usuario || !await bcrypt.compare(password, usuario.password)) { //cifrada 
        console.log(email, password);
        const error = new Error('invalid credentials');
        error.status = 401;
        next(error);
        return;

      }

      // encuentro el usuario y la password es correcta

      
      console.log('antes del token')
      // crear un JWT +

      console.log(process.env.JWT_SECRET)
      //Asi lo hacemos de manera sincrona
      const token = jwt.sign({_id: usuario._id},
                             '+oHZ-&}j7y^zd0d{]D9t%j!FL~Y3n]:&va§7Rnygl]vCt|O{^w5<§<&)5fNo@MPi',
                             { //el process.env es el fichero que hemos creado en la raiz para las pass
                              expiresIn: '2d' //es importante poner el tiempo de expiracion
                              });

      console.log(token);

      //responder

      res.json({token: token});

    } catch (err) {
      next(err);
    }
  }





}

module.exports = new LoginController();