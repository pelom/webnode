'use strict';

import {EventEmitter} from 'events';

var ProductEvents = new EventEmitter();
ProductEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  findOneAndUpdate: 'findOneAndUpdate',
  remove: 'remove'
};
function emitEvent(event) {
  return function(doc) {
    ProductEvents.emit(`${event}:${doc._id}`, doc);
    ProductEvents.emit(event, doc);
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

export default ProductEvents;
