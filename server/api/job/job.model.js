'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var AgendaJobSchema = new Schema({
  name: String,
  nextRunAt: Date
}, {collection: 'agendaJobs'});

export default mongoose.model('AgendaJob', AgendaJobSchema);
