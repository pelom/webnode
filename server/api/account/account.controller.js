'use strict';
import Account from './account.model';
import ApiService from '../api.service';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

export function domain(req, res) {
  res.status(200).json({
    //status: Account.schema.path('status').enumValues,
  });
}

const selectIndex = '_id nome descricao criador modificador proprietario updatedAt createdAt';

export function index(req, res) {
  return api.find({
    model: 'Account',
    select: selectIndex,
    where: {
      proprietario: req.user._id,
    },
    populate: [api.populationProprietario, api.populationCriador, api.populationModificador],
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}

export function show(req, res) {}
export function create(req, res) {}
export function update(req, res) {}
export function destroy(req, res) {}
