'use strict';
//import Event from './event.model';
import ContactEvents from './contact.events';

export function register() {
  console.log('register');

  ContactEvents.on('save', createListenerSave('contact:save'));
  ContactEvents.on('findOneAndUpdate', createListenerSave('contact:findOneAndUpdate'));
  ContactEvents.on('remove', createListenerRemove('contact:remove'));
}

function createListenerSave(event) {
  return function(doc) {
    console.log(event, doc);
  };
}

function createListenerRemove(event) {
  return function(doc) {
    console.log(event, doc);
  };
}
