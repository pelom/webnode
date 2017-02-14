'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var UserLoginSchema = new Schema({
  sessionid: String,
  userAgent: String,
  ip: String,
  user: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});
export default mongoose.model('UserLogin', UserLoginSchema);
