import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '../../translate/translate.service';


@Component({
    selector: 'doughnut-chart',
    templateUrl: './doughnut.view.html',
    styleUrls: ['./doughnut.style.scss']
})


export class DoughnutComponent {
    @Input() data: number[] = [1, 0, 0];
    @Output() clickEvent: EventEmitter<number> = new EventEmitter<number>();
    public labels: string[] = [];
    public type: string = 'doughnut';
    
    public options = {
        legend: {
            display: false
        }
    };
    
    public colors: any[] = [{ 
        backgroundColor:["#e74c3c", "#f39c12", "#3498db"] 
    }];


    public constructor(private _translate: TranslateService) {
        this.labels = [
            this._translate.instant('open'),
            this._translate.instant('progress'),
            this._translate.instant('done')
        ];
    };


    public catchChartEvent($event) {
        this.clickEvent.emit($event.active[0]._index);
    };
};