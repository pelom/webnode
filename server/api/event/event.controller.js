'use strict';
import Event from './event.model';
import ApiService from '../api.service';
let api = ApiService();
const selectIndex = '_id title start end descricao isAtivo proprietario, criador modificador createdAt updatedAt';
export function index(req, res) {
  //Event.create({title: 'Hello Word', start: new Date('2017-04-21'), proprietario: req.user._id});
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  console.log('firstDay', firstDay);
  console.log('lastDay', lastDay);
  console.log(Event.schema.path('status').enumValues);
  return api.find({
    model: 'Event',
    select: selectIndex,
    populate: [api.populationCriador, api.populationModificador],
    where: {
      start: { $gte: firstDay, $lt: lastDay },
      proprietario: req.user._id
    },
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}
export function show(req, res) {
}
export function create(req, res) {
}
export function update(req, res) {
}
