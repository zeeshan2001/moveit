import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { TranslateService } from '../../../translate/translate.service';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../../classes/network.class';
import { InstanceModel } from '../../../models/InstanceModel';
import { HTTPCode } from '../../../models/HTTPCodeModel';
declare var $: any;


@Component({
    selector: 'popup-application',
    templateUrl: './popupapplication.view.html',
    styleUrls: ['./popupapplication.style.scss']
})


export class PopupApplication implements AfterViewInit {
    @Input() server: InstanceModel = null;
    @Input() modalID: string = "applicationModal";
    @Output() onSave: EventEmitter<any> = new EventEmitter<any>();
    public np: NetworkPackage = null;
    public requesting: boolean = false;
    public isNew: boolean = false;
    public server_name: string = "";
    public error_message: string = "";
    public formData: any = {};


    public constructor(private _translate: TranslateService, private http: Http) {
         this.np = new NetworkPackage(http);
    };


    public ngAfterViewInit() {
        // this.openModal(); // Enable for testing purpose.
    };


    public openModal() {
        if (this.server !== null) {
            this.server_name = this.server.name;
        }
        $('#' + this.modalID).modal('show');
    };


    public fetchData($event) {
        this.formData = $event;
        this.server_name = this.formData.server_name;
        this.formData.server_name = undefined;
    };


    public save() {
        if (this.server_name.trim().length === 0) {
            this.error_message = this._translate.instant('enter_server_name');
            return;
        }

        this.np.serverApplicationPost(this.server_name, this.formData, function(response) {
            this.requesting = false;
            if (!response || !response._body) {
                return;
            }

            switch (response.status) {
                case HTTPCode.NOT_ACCEPTABLE: {
                    this.error_message = this._translate.instant('choose_another_name');
                    break;
                }
                case HTTPCode.OK: {
                    const json = JSON.parse(response._body);
                    this.onSave.emit(json._id);
                    $('#' + this.modalID).modal('toggle');
                    break;
                }
            }
        }.bind(this));
    };
};