import { Component, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { InstanceModel } from '../../models/InstanceModel';
import { TranslateService } from '../../translate/translate.service';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../classes/network.class';
import { HTTPCode } from '../../models/HTTPCodeModel';
import { CompleterService, CompleterData } from 'ng2-completer';


@Component({
    selector: 'searchfield',
    templateUrl: './searchfield.view.html',
    styleUrls: ['./searchfield.style.scss']
})


export class SearchfieldComponent implements AfterViewInit {
    @Input() content: string = "";
    @Output() contentChange: EventEmitter<string> = new EventEmitter<string>();
    @Input() type: string = "server";
    @Input() default: string = "";
    @Input() elements: string[] = null;
    public Object = Object;
    public np: NetworkPackage = null;


    public constructor(private _translate: TranslateService, private http: Http,
            private completerService: CompleterService, private cdRef:ChangeDetectorRef) {
        this.np = new NetworkPackage(http);
    };


    public contentChangeNotify() {
        this.contentChange.emit(this.content);
    };


    public ngAfterViewInit() {
        if (this.content && this.content.length === 0) {
            this.content = this.default.substr(0, this.default.length);
        }
        if (this.elements === null) {
            this.elements = [];
            this.getContentFromBackend();
        }
    };


    public ngAfterViewChecked() {
        this.cdRef.detectChanges();
    };


    public getContentFromBackend() {
        switch (this.type) {
            case "server": {
                this.np.serverFieldGet("name", function(response) {
                    if (!response || !response._body) {
                        return;
                    }
                    const json = JSON.parse(response._body);
                    this.elements = json;
                }.bind(this));
            }
        }
    };
};