'use strict';
import Lead from './lead.model';
import User from '../user/user.model';
import ApiService from '../api.service';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

const selectIndex = '_id nome sobrenome telefone celular email';

export function domain(req, res) {
  res.status(200).json({
    status: Lead.schema.path('status').enumValues,
    origem: Lead.schema.path('origem').enumValues,
    produto: Lead.schema.path('produto').enumValues,
  });
}

export function index(req, res) {
  return api.find({
    model: 'Lead',
    select: selectIndex,
    populate: [api.populationProprietario, api.populationCriador, api.populationModificador],
    where: {
      proprietario: req.user._id,
    },
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}
