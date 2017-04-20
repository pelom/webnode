'use strict';
/* eslint no-sync: 0 */
export default class HomeController {
  /*@ngInject*/
  constructor(EventoService, $scope, $compile, Auth) {
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.uiConfig = {
      calendar: {
        header: {
          //left: 'month basicWeek basicDay agendaWeek agendaDay',
          left: 'title',
          right: 'prev,next',
          center: 'today,listWeek,agendaWeek,agendaDay,month'
          //right: 'today,month,basicWeek basicDay,agendaWeek,agendaDay,listWeek'
        },
        defaultView: 'listWeek',
        locale: 'pt-br',
        lang: 'pt-br',
        height: 500,
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        selectable: true,
        eventLimit: true, // allow "more" link when too many events
        businessHours: true, // display business hours
        selectHelper: true,
        startEditable: true,
        timezone: 'local',
        loading(bool) {
          console.log('loading:', bool);
        },
        viewRender(view, /*element*/) {
          console.log("The view's title is " + view.intervalStart.format());
          console.log("The view's title is " + view.name);
          console.log("The view's title is ", view);
        },
        eventRender(event, element, view) {
          console.log('eventRender', event, element, view);
          element.attr({
            'tooltip': event.title, 'tooltip-append-to-body' : true
          });
          $compile(element)($scope);
        },
        dayClick(date) {
          console.log('dayClick', date.format());
        },
        select(startDate, endDate) {
          console.log('select', startDate.format(), endDate.format());
          var title = prompt('Event Title:');
          var eventData;
          if(title) {
            eventData = {
              title,
              start: startDate,
              end: endDate
            };
            //$('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
          }
          //$('#calendar').fullCalendar('unselect');
        }
      }
    };
    /*var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    this.eventSource2 = {
      currentTimezone: 'America/Sao_Paulo', // an option!
      color: '#000',
      backgroundColor: '#337ab7',
      textColor: '#FFF',
      eventColor: '#378006',
      events: [
        {title: 'All Day Event', start: new Date(y, m, 1)},
        {title: 'Long Event', start: new Date(y, m, d - 5), end: new Date(y, m, d - 2)},
        {id: 999, title: 'Repeating Event', start: new Date(y, m, d - 3, 16, 0), allDay: false},
        {id: 999, title: 'Repeating Event', start: new Date(y, m, d + 4, 16, 0), allDay: false},
        {title: 'Birthday Party', start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false},
        {title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29), url: 'http://google.com/'}
      ],
    };*/
    this.events = [];
    EventoService.loadEventoList()
      .then(eventList => {
        /*eventList.forEach(event => {
          console.log(event);
          event.start = new Date(event.start).toISOString().slice(0, 10);
        });
        */
        let eventSource = {
          color: '#378006',
          textColor: '#FFF',
          events: eventList
        };
        this.events.push(eventSource);
      });
  }
}
