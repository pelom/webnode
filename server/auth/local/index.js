'use strict';

import express from 'express';
import passport from 'passport';
import {signTokenUser} from '../auth.service';
//import parser from 'ua-parser-js';
import UserLogin from '../../api/user/user.login.model';

var router = express.Router();

router.post('/', function(req, res, next) {
  let userAgent = req.headers['user-agent'];
  let ip = req.ip;
  let sessionId = req.sessionID;

  passport.authenticate('local', function(err, user, info) {
    console.log('passport.authenticate', user, info, err);
    var error = err || info;
    if(error) {
      return res.status(401).json(error);
    }
    if(!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }
    let login = new UserLogin();
    login.ip = ip;
    login.userAgent = userAgent;
    login.user = user._id;
    login.sessionid = sessionId;
    login.save();
    //var ua = parser(req.headers['user-agent']);
    var token = signTokenUser(user);
    //var token = signToken(user._id, user.role);
    res.json({ token });
  })(req, res, next);
});

export default router;
