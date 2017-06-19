'use strict';

import {EventEmitter} from 'events';

var LeadEvents = new EventEmitter();
LeadEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

function emitEvent(event) {
  return function(doc) {
    LeadEvents.emit(`${event}:${doc._id}`, doc);
    LeadEvents.emit(event, doc);
  };
}

export function schemaEmit(schema) {
  console.log('schemaEmit()');

  // Register the event emitter to the model events
  for(var ev in events) {
    let event = events[ev];
    schema.post(ev, emitEvent(event));
  }
}

export default LeadEvents;
