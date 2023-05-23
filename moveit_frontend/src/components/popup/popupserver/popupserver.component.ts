import { Component, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '../../../translate/translate.service';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../../classes/network.class';
import { InstanceModel } from '../../../models/InstanceModel';
import { InsertMetaModel } from '../../../models/InsertMetaModel';
import { HTTPCode } from '../../../models/HTTPCodeModel';
declare var $: any;


@Component({
    selector: 'popup-server',
    templateUrl: './popupserver.view.html',
    styleUrls: ['./popupserver.style.scss']
})


export class PopupServer {
    @Output() onSave: EventEmitter<any> = new EventEmitter<any>();
    public np: NetworkPackage = null;
    public server: InstanceModel = null;
    public insertModel: InsertMetaModel = null;
    public attributes: {key: string, value: string}[] = [];
    public requesting: boolean = false;
    public error_message = "";


    public constructor(private _translate: TranslateService, private http: Http) {
         this.np = new NetworkPackage(http);
    };


    public openModal() {
        if (!this.insertModel) {
            this.getServerMeta();
        }
        this.attributes = [];
        this.server = new InstanceModel({});
        $("#serverModal").modal('show');
    };


    public save() {
        if (!this.server.attributes[this.insertModel.key]
                || this.server.attributes[this.insertModel.key].trim().length === 0) {
            this.error_message = this._translate.instant('enter_name');
            return;
        };

        // Extending attributes
        this.server.attributes = this.makeArrayToObject(
            this.server.attributes,
            this.attributes
        );
        // Getting and removing key from attributes.
        this.server.name = this.server.attributes[this.insertModel.key];
        // this.server.attributes[this.insertModel.key] = undefined;
        this.server.type = "server";
        
        this.sendRequest();
    };


    public getServerMeta() {
        this.np.serverMetaGet(function(response) {
            if (!response || !response._body) {
                return;
            }
            const json = JSON.parse(response._body);
            this.insertModel = new InsertMetaModel(json);
        }.bind(this));
    };


    public addAttribute() {
        this.attributes.push({
            key: '',
            value: ''
        });
    };


    public removeAttributeAt(index) {
        this.attributes.splice(index, 1);
    };


    private sendRequest() {
        this.requesting = true;
        this.np.serverPost(this.server, function(response) {
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
                    $("#serverModal").modal('toggle');
                    break;
                }
            }
        }.bind(this));
    };


    private makeArrayToObject(objInit, attributesArray) {
        for (var i = 0; i < attributesArray.length; i++) {
            const trimmedKey = attributesArray[i].key.trim();
            if (trimmedKey.length === 0) {
                continue;
            }
            objInit[trimmedKey] = attributesArray[i].value.trim();
        }
        return objInit;
    };
};