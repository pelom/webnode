'use strict';

import express from 'express';
import passport from 'passport';
import {signTokenUser, createUserLogin} from '../auth.service';
import User from '../../api/user/user.model';

var router = express.Router();
router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    console.log('passport.authenticate', user, info, err);
    var error = err || info;
    if(error) {
      return res.status(401).json(error);
    }
    if(!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }
    //var token = signToken(user._id, user.role);
    var token = signTokenUser(user);
    let userLogin = createUserLogin(req);
    User.findByIdAndUpdate(
      user._id,
      { $push: { login: { $each: [userLogin], $sort: { data: -1 } } }},
      { safe: true, upsert: true }, function(err, /*model*/) {
        console.log(err);
      }
    );
    res.json({ token });
  })(req, res, next);
});

export default router;
