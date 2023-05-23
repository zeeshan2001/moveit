import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import { CalendarModel } from '../../models/CalendarModel';
import { TranslateService } from '../../translate/translate.service';


@Component({
    selector: 'calendar-wrapper',
    templateUrl: './calendarwrapper.view.html',
    styleUrls: ['./calendarwrapper.style.scss']
})


export class CalendarWrapperComponent {
    public calendarOptions: Object;
    @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;
    @Input() entries: CalendarModel[] = [];
    @Input() events: any = [];
    @Output() notifyParentChosenDay: EventEmitter<any> = new EventEmitter<any>();
    @Output() notifyCurrentDate: EventEmitter<any> = new EventEmitter<any>();


    public constructor(private _translate: TranslateService) {

    };


    public ngOnInit() {
        this.calendarOptions = {
            editable: false,
            eventLimit: false,
            locale: this._translate.instant("lang_code"),
            displayEventTime: false,
            firstDay: 1,
            header: {
                left: 'prev',
                center: 'title',
                right: 'next'
            },
            events: this.events,
            plugins: [ 'dayGrid' ]
        };
    };


    public chooseDay($event) {
        const date = $event.date._d;
        this.notifyParentChosenDay.emit(date);
    };


    public currentDate() {
        const date = this.ucCalendar.fullCalendar("getDate")._d;
        this.notifyCurrentDate.emit(date);
    };
};
