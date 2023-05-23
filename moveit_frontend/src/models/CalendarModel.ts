export class CalendarModel {
    public title: string;
    public start: string;
    public end: string;
    public allDay: boolean;
    public color: string;
    public textColor: string;


    public constructor(response: any) {
        this.title = response.title || "";
        this.start = response.start || "";
        this.end = response.end || undefined;
        this.allDay = response.allDay || true;
        this.color = response.color || '#f1c40f';
        this.textColor = response.textColor || 'black';
    };


    public setTitle(title) {
        this.title = title;
    };


    public setStartDate(date) {
        this.start = date;
    };


    public setEndDate(date) {
        this.end = date;
    };


    public getTitle() {
        return this.title;
    };


    public getStartDate() {
        return this.start;
    };


    public getEndDate() {
        return this.end;
    };
};