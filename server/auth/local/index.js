'use strict';

import express from 'express';
import passport from 'passport';
import {authenticateLogin} from '../auth.service';

var router = express.Router();
router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    console.log('passport.authenticate', user, info, err);
    var error = err || info;
    if(error) {
      res.status(401).json(error);
      return;
    }
    if(!user) {
      res.status(404).json({message: 'Something went wrong, please try again.'});
      return;
    }
    //var token = signToken(user._id, user.role);
    var token = authenticateLogin(req, user);
    res.json({ token });
    return;
  })(req, res, next);
});

export default router;
