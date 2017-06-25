'use strict';
//import Event from './event.model';
import LeadEvents from './lead.events';
import Lead from './lead.model';
import Event from '../event/event.model';
import Account from '../account/account.model';
import Contact from '../contact/contact.model';
import Opportunity from '../opportunity/opportunity.model';
import Budget from '../budget/budget.model';

export function register() {
  console.log('register');

  LeadEvents.on('save', createListenerSave('lead:save'));
  LeadEvents.on('remove', createListenerRemove('lead:remove'));
}

function createListenerSave(event) {
  return function(doc) {
    console.log(event, doc);

    if(isConvert(doc)) {
      Lead.findOne({ _id: doc._id })
        .exec()
        .then(callbackConvertLead())
        .catch(err => {
          console.log('Ex:', err);
        });
    }
  };
}

function isConvert(doc) {
  return doc.status === 'Convertido'
    && doc.isConvertido == false;
}

function callbackConvertLead() {
  return lead => {
    console.log('callbackConvertLead()');

    Event.find({
      references: { $elemMatch: { objectId: lead._id } }
    }).then(eventos => {
      let account = createAccount(lead);
      console.log('Account:', account);

      let acc = new Account(account);
      acc.save()
        .then(callbackSaveAcc(eventos, lead))
        .catch(err => {
          console.log('Ex:', err);
        });
    });
    return lead;
  };
}

function createAccount(lead) {
  let nomeFull = `${lead.nome} ${lead.sobrenome}`;
  let account = {
    nome: isNotEmpty(lead.empresa) ? lead.empresa : nomeFull,
    origem: lead.origem,
  };

  if(isNotEmpty(lead.cpfCnpj) && lead.cpfCnpj.length == 11) {
    account.cpf = lead.cpfCnpj;
    account.nome = nomeFull;
  } else if(isNotEmpty(lead.cpfCnpj) && lead.cpfCnpj.length == 14) {
    account.cnpj = lead.cpfCnpj;
  }

  if(isNotEmpty(lead.telefone)) {
    account.telefone = lead.telefone;
  }
  if(lead.endereco) {
    account.endereco = lead.endereco;
  }
  if(lead.setor) {
    account.setor = lead.setor;
  }
  if(lead.modificador) {
    account.modificador = lead.modificador;
    account.criador = lead.modificador;
    account.proprietario = lead.modificador;
  }
  return account;
}

function callbackSaveAcc(eventos, lead) {
  return accDb => {
    console.log('callbackSaveAcc()');

    let contact = createContact(lead);
    console.log('Contact:', contact);

    let ctt = new Contact(contact);
    ctt.conta = accDb;
    ctt.save()
      .then(callbackSaveCtt(eventos, lead, accDb))
      .catch(err => {
        console.log('Ex:', err);
      });

    return accDb;
  };
}

function createContact(lead) {
  let contact = {
    nome: lead.nome,
    sobrenome: lead.sobrenome,
    origem: lead.origem,
  };
  if(isNotEmpty(lead.titulo)) {
    contact.titulo = lead.titulo;
  }
  if(isNotEmpty(lead.email)) {
    contact.email = lead.email;
  }
  if(isNotEmpty(lead.telefone)) {
    contact.telefone = lead.telefone;
  }
  if(isNotEmpty(lead.celular)) {
    contact.celular = lead.celular;
  }
  if(isNotEmpty(lead.descricao)) {
    contact.descricao = lead.descricao;
  }
  if(lead.modificador) {
    contact.modificador = lead.modificador;
    contact.criador = lead.modificador;
    contact.proprietario = lead.modificador;
  }
  return contact;
}

function callbackSaveCtt(eventos, lead, accDb) {
  return cttDb => {
    console.log('callbackSaveCtt()');

    let op = createOpportunity(lead, accDb, cttDb);
    let opp = new Opportunity(op);
    opp.save()
      .then(callbackSaveOpp(eventos, lead, accDb, cttDb))
      .catch(err => {
        console.log('Ex:', err);
      });

    return cttDb;
  };
}

function createOpportunity(lead, acc, ctt) {
  let opportunity = {
    nome: acc.nome,
    conta: acc._id,
    origem: lead.origem,
  };

  if(lead.modificador) {
    opportunity.modificador = lead.modificador;
    opportunity.criador = lead.modificador;
    opportunity.proprietario = lead.modificador;
  }
  return opportunity;
}

function callbackSaveOpp(eventos, lead, accDb, cttDb) {
  return opp => {
    console.log('callbackSaveCtt()');
    let bud = createBudget(lead, accDb, cttDb, opp);
    let budget = Budget(bud);
    budget.save()
      .then(callbackSaveBudget(eventos, lead, accDb, cttDb, opp))
      .catch(err => {
        console.log('Ex:', err);
      });
  };
}

function createBudget(lead, acc, ctt, opp) {
  let budget = {
    nome: acc.nome,
    conta: acc._id,
    contato: ctt._id,
    oportunidade: opp._id
  };
  if(lead.modificador) {
    budget.modificador = lead.modificador;
    budget.criador = lead.modificador;
    budget.proprietario = lead.modificador;
  }
  return budget;
}

function callbackSaveBudget(eventos, lead, acc, ctt, opp) {
  return budget => {
    let accRef = createReferenceAcc(acc);
    console.log('accRef:', accRef);
    let cttRef = createReferenceCtt(ctt);
    console.log('cttRef:', cttRef);
    let oppRef = createReferenceOpp(opp);
    console.log('oppRef:', oppRef);

    Lead.findByIdAndUpdate(lead._id,
    { isConvertido: true, status: 'Convertido'})
    .then(leadConvertido => {
      console.log('Lead convertido com sucesso', lead._id);

      eventos.forEach(ev => {
        Event.findByIdAndUpdate(ev._id,
          { $push: { references: { $each: [accRef, cttRef, oppRef] } }})
          .exec()
          .then(e => {
            console.log('Event references ', e._id);
          });
      });

      return leadConvertido;
    })
    .catch(err => {
      console.log('Ex:', err);
    });
  };
}
function createReferenceAcc(acc) {
  return {
    name: `Conta ${acc.nome}`,
    description: acc.descricao ? `${acc.descricao}` : '',
    objectId: `${acc._id}`,
    object: 'Account'
  };
}

function createReferenceCtt(ctt) {
  return {
    name: `Contato ${ctt.nome} ${ctt.sobrenome}`,
    description: ctt.descricao ? `${ctt.descricao}` : '',
    objectId: `${ctt._id}`,
    object: 'Contact'
  };
}

function createReferenceOpp(opp) {
  return {
    name: `Oportunidade ${opp.nome}`,
    description: opp.descricao ? `${opp.descricao}` : '',
    objectId: `${opp._id}`,
    object: 'Opportunity'
  };
}

function isNotEmpty(value) {
  return value && value.length != 0;
}

function createListenerRemove(event) {
  return function(doc) {
    console.log(event, doc);
  };
}
