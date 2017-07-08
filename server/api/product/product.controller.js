'use strict';
import Product from './product.model';
import ApiService from '../api.service';
import ProductPdf from '../../components/genarate-pdf/product.pdf';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

export function domain(req, res) {
  Product.find().distinct('categoria', function(error, cats) {
    res.status(200).json({
      unidade: Product.schema.path('unidade').enumValues,
      uso: Product.schema.path('uso').enumValues,
      categorias: cats
    });
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
        nome: 1
      }
    }
  }, res);
}

function buildWhere(req) {
  let where = {
  };

  if(req.query.search) {
    var reg = new RegExp(`^${req.query.search}`, 'i');
    where.$or = [
      { nome: { $in: reg } },
      { codigoFornecedor: reg },
    ];
  }

  if(req.query.categoria) {
    where.categoria = { $in: [req.query.categoria]};
  }

  if(req.query.uso) {
    let usoList = req.query.uso;
    where.uso = { $in: usoList };
  }
  return where;
}

const selectShow = '_id nome codigo descricao categoria marca modelo subcategoria'
  + ' uso unidade criador modificador createdAt updatedAt subproduto precificacao'
  + ' codigoFornecedor';

const populationSubproduto = {
  path: 'subproduto.produto',
  select: '_id nome categoria unidade precos'
};

export function show(req, res) {
  return Product.find({_id: req.params.id}, selectShow, {
    limit: 1
  })
    .populate([populationSubproduto,
      api.populationCriador, api.populationModificador])
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
  productJson.subproduto = req.body.subproduto;
  Product.findByIdAndUpdate(req.params.id, productJson)
    .populate([populationPrice])
    .then(handleEntityNotFound(res))
    .then(produto => {
      //produto.subproduto = req.body.subproduto;
      //produto.save();

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
    marca: req.body.marca,
    modelo: req.body.modelo,
    codigo: req.body.codigo,
    categoria: req.body.categoria,
    subcategoria: req.body.subcategoria,
    uso: req.body.uso,
    unidade: req.body.unidade,
    proprietario: req.user._id,
    modificador: req.user._id,
    precificacao: req.body.precificacao,
    codigoFornecedor: req.body.codigoFornecedor,
  };
}
export function destroy(req, res) {}

const selectCatalog = '_id nome codigo categoria subcategoria descricao'
  + ' marca modelo uso unidade precos subproduto precificacao';

const populationPrice = {
  path: 'precos',
  select: '_id valor data descricao custo markup',
  options: {
    limit: 10
  }
};

const populationPriceUser = {
  path: 'precos.user',
  select: '_id nome sobrenome',
};

export function indexCatalog(req, res) {
  let where = {
    uso: { $in: ['00 - Mercadoria para Revenda', '09 - Serviços', '10 - Outros insumos'] },
    //unidade: { $ne: '% - Porcentagem' }
  };

  if(req.query.search) {
    var reg = new RegExp(`^${req.query.search}`, 'i');
    where.$or = [
      { nome: { $in: reg } },
    ];
  } else if(req.query.searchFull) {
    let regexs = [];
    let searchs = req.query.searchFull.split(' ');
    searchs.forEach(item => {
      if(item.trim().length > 2) {
        var regFull = new RegExp(item, 'i');
        regexs.push(regFull);
      }
    });
    where.$or = [
      { nome: { $in: regexs } },
    ];
  }

  if(req.query.price) {
    where.precos = { $exists: true, $not: { $size: 0 } };
    where.unidade = { $ne: '% - Porcentagem' };
    where.categoria = { $nin: ['Despesa Fixa'] };
  }

  if(req.query.categoria) {
    where.categoria = { $in: [req.query.categoria]};
  }
  console.log('WHERE', where);
  return api.find({
    model: 'Product',
    select: selectCatalog,
    where,
    populate: [populationSubproduto,
      populationPrice, populationPriceUser,
      api.populationCriador, api.populationModificador],
    options: { skip: 0, limit: 50,
      sort: {
        nome: 1
      }
    }
  }, res);
}

export function addprice(req, res) {
  console.log('req.params.id', req.params.id);
  console.log('req.body', req.body);

  let productPrice = {
    valor: req.body.valor,
    custo: req.body.custo,
    user: req.user._id,
    descricao: req.body.descricao,
  };
  Product.findByIdAndUpdate(req.params.id,
    { $push: { precos: { $each: [productPrice], $sort: { data: -1 } } } },
    { new: true })
    .populate([populationPrice])
    .then(callbackAddPrice(res))
    .catch(handleError(res));
}

function callbackAddPrice(res) {
  return product => {
    res.status(201).json(true);
    return product;
  };
}

export function showPdf(req, res) {
  return res.status(201).json(true);

  // let productMap = new Map();
  // Product.findById(req.params.id)
  //   .select(selectCatalog)
  //   .populate([populationSubproduto,
  //     populationPrice, populationPriceUser,
  //     api.populationCriador, api.populationModificador])
  //   .exec()
  //   .then(product => {
  //
  //   })
  // .catch(handleError(res));
}
