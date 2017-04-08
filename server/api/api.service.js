'use strict';
import {handleError, respondWithResult, handleEntityNotFound, handleValidationError} from './utils/response';
import {populationCriador, populationModificador, populationProfile} from './utils/population';
mongoose.Promise = require('bluebird');
import mongoose from 'mongoose';

export default function ApiService() {
  let API = {
    find(query, res) {
      let model = mongoose.model(query.model);
      return model.find(query.where, query.select, query.options)
        .populate(query.populate)
        .exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
    },
    findById(id, query, res) {
      let model = mongoose.model(query.model);
      return model.findById(id)
        .select(query.select)
        .populate(query.populate)
        .exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
    },
    handleError,
    respondWithResult,
    handleEntityNotFound,
    handleValidationError,
    populationCriador,
    populationModificador,
    populationProfile
  };
  return API;
}
