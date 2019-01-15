const express = require('express');
const passport = require('passport');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
const User = require('../models/user');


router.post('/', (req, res, next) => {

    const {fullname, username, password } = req.body
  
    if (!username) {
    const err = new Error('Missing `User Name` in request body');
    err.status = 422;
    return next(err);
    }

    if (!password) {
      const err = new Error('Missing `Password` in request body');
      err.status = 422;
      return next(err);
    }
    
    if (username.length < 1) {
        const err = new Error('User name must be atleast length 1')
        err.status = 422;
        return next(err);
    }
    if (password.length < 8 || password.length > 72) {
        const err = new Error('Password must be a minimum of 8 characters and a maximum of 72')
        err.status = 422;
        return next(err);
    }
    if (username.trim().length !== username.length) {
        const err = new Error('Username must not have any leading or trailing whitespaces')
        err.status = 422;
        return next(err)
    }
    if (password.trim().length !== password.length) {
        const err = new Error('Password must not have any leading or trailing whitespaces')
        err.status = 422;
        return next(err)
    }


    return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        fullname
      };
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`http://${req.headers.host}/api/users/${result.id}`).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      console.log(err.message);
      next(err);
    });

  });

module.exports = router;