'use strict';
//import Event from './event.model';
import EventEvents from './event.events';
import Event from './event.model';

export function register() {
  console.log('register');

  EventEvents.on('save', createListenerSave('event:save'));
  EventEvents.on('remove', createListenerRemove('event:remove'));
}

function createListenerSave(event) {
  return function(doc) {
    console.log(event, doc);
    if(doc.origin) {
      addTask(doc);
    }
  };
}

function addTask(doc) {
  console.log('addTask()');
  Event.findByIdAndUpdate(doc.origin,
    { $push: { tarefas: { $each: [doc._id], $sort: { start: 1 } } }},
    { safe: true }, function(err, /*model*/) {
      if(err) {
        console.log(err);
        return;
      }
      console.log('Save tarefa id: ', doc._id);
    }
  );
}

function createListenerRemove(event) {
  return function(doc) {
    console.log(event, doc);
    if(doc.origin) {
      console.log('Delete event origin: ', doc.origin);
      removeTask(doc);
    }

    if(doc.tarefas && doc.tarefas.length) {
      console.log('Delete event tarefas: ', doc.tarefas);

      doc.tarefas.forEach(item => {
        removeOrigin(item);
      });
    }
  };
}

function removeTask(doc) {
  console.log('removeTask()');
  Event.findByIdAndUpdate(doc.origin._id,
    { $pull: { tarefas: { $in: [doc._id] } } },
    { safe: true }, function(err, /*model*/) {
      if(err) {
        console.log(err);
        return;
      }
      console.log('Delete tarefa id: ', doc._id);
    }
  );
}

function removeOrigin(doc) {
  console.log('removeOrigin()');
  Event.findByIdAndUpdate(doc._id,
    { origin: undefined },
    { safe: true }, function(err, /*model*/) {
      if(err) {
        console.log(err);
        return;
      }
      console.log('Delete origin:', doc);
    }
  );
}
