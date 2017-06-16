'use strict';
//import Event from './event.model';
import ContactEvents from './contact.events';
import Contact from './contact.model';
import Account from '../account/account.model';

export function register() {
  console.log('register');

  ContactEvents.on('save', createListenerSave('contact:save'));
  ContactEvents.on('remove', createListenerRemove('contact:remove'));
}

function createListenerSave(event) {
  return function(doc) {
    console.log(event, doc);
    if(doc.conta) {
      addContact(doc);
      /*Account.findById(doc.conta, '_id contatos')
      .population({
        path: 'contatos',
        select: '_id nome'
      })
      .exec()
      .then(account => {
        console.log('Account:', account);
        if(!account) {
          return;
        }
        let found = false;
        account.contatos.forEach(item => {
          if(item._id == doc._id) {
            found = true;
          }
        });

        if(!found) {

        }
      });*/
    }
  };
}

function addContact(doc) {
  Account.findByIdAndUpdate(doc.conta,
    { $push: { contatos: { $each: [doc._id], $sort: { start: 1 } } }},
    { safe: true }, function(err, /*model*/) {
      if(err) {
        console.log(err);
        return;
      }
      console.log('Save contac id: ', doc._id);
    }
  );
}

function createListenerRemove(event) {
  return function(doc) {
    console.log(event, doc);
  };
}
