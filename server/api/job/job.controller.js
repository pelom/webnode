'use strict';
import AgendaJob from './job.model';
//import ApiService from '../api.service';
//let api = ApiService();
//let handleError = api.handleError;
//let handleEntityNotFound = api.handleEntityNotFound;
//let handleValidationError = api.handleValidationError;
const selectIndex = '_id name type priority nextRunAt repeatInterval'
  + ' lastModifiedBy lockedAt lastFinishedAt';
export function index(req, res) {
  /*AgendaJob.count({}, function(err, count) {
    if(err) return;
    console.log(count);
  });*/
  AgendaJob.find({}, selectIndex)
    .then(result => {
      res.status(200).json(result);
    });
}
