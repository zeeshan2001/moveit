import { Component, Input, Output, EventEmitter} from '@angular/core';
import { TranslateService } from '../../translate/translate.service';
import { HistoryModel } from '../../models/HistoryModel';


@Component({
    selector: 'historybox',
    templateUrl: './historybox.view.html',
    styleUrls: ['./historybox.style.scss']
})


export class HistoryBox {
    @Input() items: HistoryModel[] = [];

 
    public constructor(private _translate: TranslateService) {
    };
};