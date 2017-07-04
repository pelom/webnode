'use strict';
import Product from './product.model';
import ProductEvents from './product.events';

export function register() {
  console.log('register');

  ProductEvents.on('save', createListenerSave('product:save'));
  ProductEvents.on('findOneAndUpdate', createListenerSave('product:findOneAndUpdate'));
  ProductEvents.on('remove', createListenerRemove('product:remove'));
}

const selectCatalog = '_id nome codigo categoria subcategoria descricao'
  + ' marca modelo uso unidade precos subproduto precificacao modificador';

const populationSubproduto = {
  path: 'subproduto.produto',
  select: '_id nome categoria unidade precos'
};

const populationPrice = {
  path: 'precos',
  select: '_id valor data descricao custo',
  options: {
    limit: 10
  }
};

function createListenerSave(event) {
  return function(doc) {
    console.log(event, doc.nome);

    Product.findById(doc._id)
      .select(selectCatalog)
      .populate([populationSubproduto, populationPrice])
      .exec()
      .then(produto => {
        processIndice(produto);
      });
  };
}
function createListenerRemove(event) {
  return function(doc) {
    console.log(event, doc);
  };
}

function processIndice(product) {
  console.log('processIndice()', product.unidade, product.nome);

  if(!isProductIndice(product) || !product.subproduto) {
    console.log('Produto nao pertence a classe indices');
    return;
  }

  let indiceTotal = 0;
  product.subproduto.forEach(subItem => {
    console.log('Subproduto:', subItem.produto.nome, subItem.unidade);

    let info = createSubItemInfo(subItem);
    console.log('Info:', info);

    if(isProductIndice(subItem)) {
      if(info && info.valor) {
        subItem.quantidade = info.valor;
      }
      indiceTotal += subItem.quantidade;
    }
  });

  if(indiceTotal == 0) {
    console.log('Precificacao do indice esta zerada');
    processSubprodutoIndice(product);
    return;
  }

  if(isProductPrice(product) && product.precos[0].valor === indiceTotal) {
    console.log('Precificacao do indice nao foi alterado');
    return;
  }

  priceIndice(product, indiceTotal);
}

function isProductIndice(produto) {
  return produto.unidade === '% - Porcentagem';
}

function createSubItemInfo(subItem) {
  if(isProductPrice(subItem.produto)) {
    return createInfo(subItem.produto);
  }
  return null;
}

function createInfo(product) {
  if(isProductPrice(product)) {
    let lastPrice = product.precos[0];
    return {
      valor: lastPrice.valor,
      valorTotal: product.quantidade * lastPrice.valor,
      custo: lastPrice.custo,
      custoTotal: product.quantidade * lastPrice.custo,
    };
  }
  return null;
}

function isProductPrice(produto) {
  return produto.precos && produto.precos.length > 0;
}

function priceIndice(product, valor) {
  console.log('priceIndice()', product.nome, valor);

  let productPrice = {
    valor,
    descricao: 'Índice adicionado pela precificação',
    user: product.modificador
  };

  Product.findByIdAndUpdate(product._id,
    { $push: { precos: { $each: [productPrice], $sort: { data: -1 } } } },
    { new: true })
    .populate([populationPrice])
    .then(prt => {
      console.log('Novo preco', prt.precos[0].valor);
      processSubprodutoIndice(product);
    });
}

function processSubprodutoIndice(product) {
  console.log('processSubprodutoIndice()');
  Product.find({ 'subproduto.produto': product._id})
    .select(selectCatalog)
    .populate([populationSubproduto, populationPrice])
    .exec()
    .then(products => {
      if(products.length == 0) {
        console.log('Produto nao esta contido em nenhum produto');
        return;
      }
      console.log(`${product.nome} esta contido em ${products.length} produtos`);

      products.forEach(item => {
        console.log(`Atualizando ${item.nome} precificacao=${item.precificacao}`);
        processIndice(item);
        if(item.precificacao && item.precificacao === true) {
          priceProductMarkup(item);
        }
      });
    });
}

function priceProductMarkup(product) {
  console.log('priceProductMarkup()', product);
  let info = createInfo(product);
  console.log(info);
  if(!info) {
    console.log('Produto sem preco');
    return;
  } else if(!info.custo || info.custo === 0) {
    console.log('Produto sem custo');
    return;
  }

  let indiceTotal = 0;
  // let custoTotal = 0;
  // let vendaTotal = 0;
  let indices = [];
  product.subproduto.forEach(subItem => {
    let infoSubItem = createSubItemInfo(subItem);
    if(isProductIndice(subItem)) {
      if(infoSubItem && infoSubItem.valor) {
        subItem.quantidade = infoSubItem.valor;
      }
      indiceTotal += subItem.quantidade;
      indices.push(subItem.quantidade);
    }

    // if(infoSubItem && infoSubItem.valorTotal) {
    //   vendaTotal += infoSubItem.valorTotal;
    // }
    // if(infoSubItem && infoSubItem.custoTotal) {
    //   custoTotal += infoSubItem.custoTotal;
    // }
  });
  if(indices.length == 0) {
    console.log('Produto sem indices');
    return;
  }
  priceMarkup(product, info, indices);
}

function priceMarkup(product, info, indices) {
  console.log('priceMarkup()', product.nome, info, indices);

  let markup = calcMarkup(indices);
  let valor = info.custo * markup;

  let productPrice = {
    valor,
    markup,
    custo: info.custo,
    descricao: 'Preço adicionado pelo markup',
    user: product.modificador
  };

  Product.findByIdAndUpdate(product._id,
    { $push: { precos: { $each: [productPrice], $sort: { data: -1 } } } },
    { new: true })
    .populate([populationPrice])
    .then(prt => {
      console.log('Novo preco markup', prt.precos[0].valor);
    });
}

function calcMarkup(indices) {
  let markup = 1.0000;
  indices.forEach(value => {
    markup -= value / 100;
  });
  return 1.0000 / markup;
}
