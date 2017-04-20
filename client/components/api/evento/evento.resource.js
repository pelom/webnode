export function EventoResource($resource) {
  'ngInject';
  return $resource('/api/event/:id/:controller', {
    id: '@_id'
  }, {
    update: { method: 'PUT' },
  });
}
