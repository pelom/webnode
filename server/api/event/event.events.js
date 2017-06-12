'use strict';

import {EventEmitter} from 'events';
//import Event from './event.model';

var EventEvents = new EventEmitter();
EventEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

/*for(var e in events) {
  let event = events[e];
  Event.schema.post(e, emitEvent(event));
}*/

function emitEvent(event) {
  return function(doc) {
    EventEvents.emit(`${event}:${doc._id}`, doc);
    EventEvents.emit(event, doc);
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

export default EventEvents;
