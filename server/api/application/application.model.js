'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var ApplicationSchema = new Schema({
  name: String,
  applications: [{}],
  profiles: [{}],
  isAtivo: {
    type: String,
    required: true,
    default: true
  },
}, {
  timestamps: true
});

export default mongoose.model('Application', ApplicationSchema);
