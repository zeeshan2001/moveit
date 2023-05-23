import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '../../translate/translate.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoginModel } from '../../models/LoginModel';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../classes/network.class';
import { Config } from '../../app/config';
import { CalendarModel } from '../../models/CalendarModel';
import { InstanceModel } from '../../models/InstanceModel';
import { ComponentModel } from '../../models/ComponentModel';


@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.view.html',
    styleUrls: ['./calendar.style.scss']
})


export class CalendarComponent implements AfterViewInit {
    public np: NetworkPackage = null;
    public chosenFilter: string = "server";
    public currentDate: Date = new Date();
    public calendarContent: CalendarModel[] = [];
    public resultsForDay:any = {start: [], end: []};
    public resultsForDayApp: any = {start: [], end: []};
    public chosenServer: any = null;
    public chosenAppName = "";
    public calenderEvents: any = [];
    public eventsLoaded: boolean = false;


    public constructor(public _translate: TranslateService, private aRouter: ActivatedRoute,
            public router: Router, public http: Http, public cref: ChangeDetectorRef) {
        this.np = new NetworkPackage(http);
        this.np.serversGet(function(response) {
          if (!response || !response._body) {
            this.eventsLoaded = true;
          } else {
            const json = JSON.parse(response._body);
            const colors = ['red', 'green', 'blue', 'purple'];
            for (let i = 0; i < json.length; i++) {
              let current_server = json[i];
              if (Object.keys(current_server.workflow.timeline_known).length > 1) {
                let current_event = {title: current_server.name, textColor: '#fff',
                  color: colors[Math.floor(Math.random() * colors.length)]};
                if (current_server.workflow.timeline_known.date1 !== undefined) {
                  current_event['start'] = current_server.workflow.timeline_known.date1.substr(0, 10) + "T09:00:00";
                }

                if (current_server.workflow.timeline_known.date2 !== undefined) {
                  current_event['end'] = current_server.workflow.timeline_known.date2.substr(0, 10) + "T09:00:00";
                }
                this.calenderEvents.push(current_event);
              }
            }
            this.eventsLoaded = true;
          }
        }.bind(this));
    };


    public ngAfterViewInit() {
        this.changeFilter(this.chosenFilter);
    };


    public getServer(_id) {
        if (this.chosenFilter !== 'component') {
            this.np.serverGet(_id, function(response) {
                if (!response || !response._body) {
                    return;
                }
                const json = JSON.parse(response._body);
                this.chosenServer = json;
            }.bind(this));
        } else {
            this.np.componentGet(_id, function(response) {
                if (!response || !response._body) {
                    return;
                }
                const json = JSON.parse(response._body);
                this.chosenServer = json;
            }.bind(this));
        }
    };


    public closeServer() {
        this.chosenServer = null;
    };


    public changeFilter(newName) {
        this.chosenFilter = newName;
        this.fetchDataFor(this.currentDate);
    };


    // If doing any changes to chosen server.
    public reloadServer() {
        this.np.serverGet(this.chosenServer._id, function(response) {
            if (!response || !response._body) {
                return;
            }
            if (this.chosenFilter === "---") {
                this.chosenFilter = "server";
            }
            const json = JSON.parse(response._body);
            this.chosenServer = json;
            this.fetchDataFor(this.currentDate);

            if (this.chosenFilter === 'app') {
                this.getServerForApp(this.chosenAppName);
            } else {
                this.dayClicked(this.currentDate);
            }
        }.bind(this));
    };


    public getAppContent() {
        this.np.scheduleApp(this.currentDate.getFullYear(),
            this.currentDate.getMonth() + 1,
        function(response) {
            if (!response || !response._body) {
                return;
            }
            this.calendarContent = [];
            this.implementCalendarByData(response._body);
        }.bind(this))
    };


    public getComponentContent() {
        this.np.scheduleComponent(this.currentDate.getFullYear(),
            this.currentDate.getMonth() + 1,
        function(response) {
            if (!response || !response._body) {
                return;
            }
            this.calendarContent = [];
            this.implementCalendarByData(response._body);
        }.bind(this))
    };


    public getServerContent() {
        this.np.scheduleServer(this.currentDate.getFullYear(),
            this.currentDate.getMonth() + 1,
        function(response) {
            if (!response || !response._body) {
                return;
            }
            this.calendarContent = [];
            this.implementCalendarByData(response._body);
        }.bind(this))
    };


    // Helper method
    private implementCalendarByData(_json) {
        const json = JSON.parse(_json);
        this.addEntries(json.starting, undefined, undefined);
        this.addEntries(json.ending, '#e74c3c', 'white');
    };


    // Helper method
    private addEntries(part, color, textColor) {
        var parting = Object.keys(part);

        for (var i = 0; i < parting.length; i++) {
            const _d = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                parseInt(parting[i])
            );
            const entry = new CalendarModel({
                title: this._translate.instant(this.chosenFilter)
                        +': '+ part[parting[i]],
                start: _d,
                allDay: true,
                color: color,
                textColor: textColor
            });
            this.calendarContent.push(entry);
        }
    };


    /**
     *  Loading entries for given day and showing them.
     *  @param date is the chosen date from calendar.
     */
    public dayClicked(date) {
        const day = date.getDate();
        const month = this.currentDate.getMonth() + 1;
        const year = this.currentDate.getFullYear();
        const type = this.chosenFilter || 'server';

        this.np.scheduleGetDay(type, year, month, day, function(response) {
            this.handleServerRequest(response);
        }.bind(this));
    };


    public getServerForApp(appName) {
        this.chosenAppName = appName;

        this.np.applicationServersGet(appName, 'all', function(response) {
            this.chosenFilter = "---";
            if (!response || !response._body) {
                return;
            }
            const json = JSON.parse(response._body);

            var tmp = this.resultsForDay;
            if (this.chosenFilter === 'app') {
                tmp = this.resultsForDayApp;
            }
            tmp.start = [];
            tmp.end = [];

            for (var i = 0; i < json.length; i++) {
                tmp.start.push(json[i]);
            }
        }.bind(this));
    };


    private handleServerRequest(response) {
        if (!response || !response._body) {
            return;
        }
        const json = JSON.parse(response._body);

        var tmp = this.resultsForDay;
        if (this.chosenFilter === 'app') {
            tmp = this.resultsForDayApp;
        }
        tmp.start = [];
        tmp.end = [];

        for (var i = 0; i < json.start.length; i++) {
            tmp.start.push(json.start[i]);
        }
        for (var i = 0; i < json.end.length; i++) {
            tmp.end.push(json.end[i]);
        }
    };


    /**
     *  Notify in case of an change in calendar.
     *  E.g. chaning month
     *  @param date: current shown date in calendar.
     */
    public fetchDataFor(date) {
        this.chosenServer = null;
        this.chosenAppName = "";
        this.resultsForDay = {start: [], end: []};
        this.resultsForDayApp = {start: [], end: []};

        this.currentDate = date;
        switch (this.chosenFilter) {
            case "server": {
                return this.getServerContent();
            }
            case "app": {
                return this.getAppContent();
            }
            case "component": {
                return this.getComponentContent();
            }
        }
    };
};
