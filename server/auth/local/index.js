'use strict';

import express from 'express';
import passport from 'passport';
import {signTokenUser} from '../auth.service';
import UAParser from 'ua-parser-js';
import User from '../../api/user/user.model';

var router = express.Router();

router.post('/', function(req, res, next) {
  let uAgent = req.headers['user-agent'];
  let uIp = req.ip;
  let uSessionId = req.sessionID;

  var parser = new UAParser();
  parser.setUA(uAgent);
  var result = parser.getResult();
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
    let userLogin = {
      ip: uIp,
      userAgent: uAgent,
      sessionid: uSessionId,
      browser: {
        name: result.browser.name ? result.browser.name : '',
        version: result.browser.version ? result.browser.version : ''
      },
      device: {
        model: result.device.model ? result.device.model : '',
        type_: result.device.type ? result.device.type : '',
        vendor: result.device.vendor ? result.device.vendor : '',
      },
      os: {
        name: result.os.name ? result.os.name : '',
        version: result.os.version ? result.os.version : ''
      }
    };
    User.findByIdAndUpdate(
      user._id,
      { $push: { login: { $each: [userLogin], $sort: { data: -1 } } }},
      { safe: true, upsert: true }, function(err, model) {
        console.log(err);
      }
    );
    res.json({ token });
  })(req, res, next);
});

export default router;
