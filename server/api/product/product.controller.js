'use strict';
import Product from './product.model';
import ApiService from '../api.service';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

export function domain(req, res) {
  res.status(200).json({
    unidade: Product.schema.path('unidade').enumValues,
    uso: Product.schema.path('uso').enumValues,
  });
}

const selectIndex = '_id nome codigo modelo categoria'
  + ' uso unidade criador modificador createdAt updatedAt';

export function index(req, res) {
  return api.find({
    model: 'Product',
    select: selectIndex,
    where: buildWhere(req),
    populate: [api.populationCriador, api.populationModificador],
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}

function buildWhere(req) {
  if(req.query.uso) {
    let usoList = req.query.uso;
    console.log(usoList[0]);
    return {
      uso: { $in: usoList },
    };
  }
  return {
  };
}

const selectShow = '_id nome codigo descricao categoria marcar modelo subcategoria'
  + ' uso unidade criador modificador createdAt updatedAt subproduto';

const populationSubproduto = {
  path: 'subproduto.produto',
  select: '_id nome categoria unidade'
};

export function show(req, res) {
  return Product.find({_id: req.params.id}, selectShow, {
    limit: 1
  })
    .populate([populationSubproduto, api.populationCriador, api.populationModificador])
    .exec()
    .then(produtos => {
      if(produtos.length == 0) {
        handleEntityNotFound(res)();
      }
      return respondWithResult(res)(produtos[0]);
    })
    .catch(handleError(res));
}

export function create(req, res) {
  let product = requestProductCreate(req);
  console.log('Product:', product);
  product.save()
    .then(callbackCreateProduct(req, res))
    .catch(handleValidationError(res));
}

function requestProductCreate(req) {
  var product = new Product(req.body);
  product.criador = req.user._id;
  product.modificador = req.user._id;
  product.proprietario = req.user._id;
  return product;
}

function callbackCreateProduct(req, res) {
  return function(product) {
    res.status(201).json(true);
    return product;
  };
}

export function update(req, res) {
  let productJson = requestUpdateProduct(req);
  Product.findByIdAndUpdate(req.params.id, productJson)
    .then(handleEntityNotFound(res))
    .then(produto => {
      produto.subproduto = req.body.subproduto;
      produto.save();

      req.params.id = produto._id;
      return show(req, res);
    })
    .catch(handleError(res));
}

function requestUpdateProduct(req) {
  return {
    _id: req.body._id,
    nome: req.body.nome,
    descricao: req.body.descricao,
    marcar: req.body.marcar,
    modelo: req.body.modelo,
    codigo: req.body.codigo,
    categoria: req.body.categoria,
    subcategoria: req.body.subcategoria,
    uso: req.body.uso,
    unidade: req.body.unidade,
    proprietario: req.user._id,
    modificador: req.user._id,
  };
}
export function destroy(req, res) {}

const selectCatalog = '_id nome codigo categoria';

const populationPrice = {
  path: 'precos',
  select: '_id valor data',
  options: {
    sort: { data: -1 },
    limit: 1
  }
};

export function indexCatalog(req, res) {
  return api.find({
    model: 'Product',
    select: selectCatalog,
    where: {
      uso: { $in: ['00 - Mercadoria para Revenda', '09 - Serviços;'] },
    },
    populate: [populationPrice, api.populationCriador, api.populationModificador],
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}
