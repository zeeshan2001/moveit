import { Component, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '../../../translate/translate.service';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../../classes/network.class';
import { InsertMetaModel } from '../../../models/InsertMetaModel';
import { InstanceModel } from '../../../models/InstanceModel';
import { HTTPCode } from '../../../models/HTTPCodeModel';
declare var $: any;


@Component({
    selector: 'inventory-app',
    templateUrl: './inventoryapp.view.html',
    styleUrls: ['./inventoryapp.style.scss']
})


export class InventoryAppComponent implements AfterViewInit {
    public requesting: boolean = false;
    public np: NetworkPackage = null;
    public attributes_mandatory: {} = {};
    public server_name: string = "";
    public insertModel: InsertMetaModel;
    public attributes: {key: string, value: string}[] = [];
    @Input() givenServerName: string = ""; // Blocking search field. Fixed name.
    @Input() instanceAttributes: any = {};
    @Input() showServer: boolean = false;
    @Input() key: string = "";
    @Input() category: string = "";
    @Output() onDataChange: EventEmitter<any> = new EventEmitter<any>();


    public constructor(private _translate: TranslateService, private http: Http, private cdRef:ChangeDetectorRef) {
         this.np = new NetworkPackage(http);
    };


    public ngAfterViewChecked() {
        this.cdRef.detectChanges();
        this.sendDataToParent();
    };


    public ngOnChanges(changes) {
        if (changes.instanceAttributes && !this.instanceAttributes) {
            this.attributes = [];
        } else if (changes.instanceAttributes && this.instanceAttributes) {
            this.makeObjctToArray(changes.instanceAttributes.currentValue);
        }
        if (this.givenServerName) {
            this.server_name = this.givenServerName;
        }
    };


    public ngAfterViewInit() {
        if (!this.attributes) {
            this.attributes = [];
        }
        this.attributes_mandatory = {};
        this.getServerMeta();
    };


    public addAttribute() {
        this.attributes.push({
            key: '',
            value: ''
        });
    };


    // Inverse to makeArrayToObject
    private makeObjctToArray(objInput) {
        this.cdRef.detectChanges();
        if (!this.insertModel) {
            return;
        }
        if (!objInput) {
            objInput = {};
        }
        const mandatory        = this.insertModel.mandatory;
        const instanceKey      = this.insertModel.key;
        var array              = [];
        var arraymandatory:any = {};

        objInput[instanceKey] = this.key;

        const keys             = Object.keys(objInput);
        for (var i = 0; i < keys.length; i++) {
            const key = keys[i];
            var found = false;
            for (var j = 0; j < mandatory.length; j++) {
                if (mandatory[j] === key) {
                    arraymandatory[key] = objInput[key];
                    found = true;
                }
            }
            if (!found) {
                array.push({
                    key: key,
                    value: objInput[key]
                });
            }
        }
        this.attributes_mandatory = arraymandatory;
        this.attributes = array;
    };


    private makeArrayToObject(objInit, attributesArray) {
        objInit = JSON.parse(JSON.stringify(objInit));
        attributesArray = JSON.parse(JSON.stringify(attributesArray));

        for (var i = 0; i < attributesArray.length; i++) {
            const trimmedKey = attributesArray[i].key.trim();
            if (trimmedKey.length === 0) {
                continue;
            }
            if (typeof attributesArray[i].value === "string") {
                attributesArray[i].value = attributesArray[i].value.trim();
            }
            objInit[trimmedKey] = attributesArray[i].value;
        }
        return objInit;
    };


    public setServerName($event) {
        this.server_name = $event;
        this.sendDataToParent();
    };


    public getServerMeta() {
        if (this.category === "applications") {
            this.np.applicationsMetaGet(function(response) {
                if (!response || !response._body) {
                    return;
                }
                const json = JSON.parse(response._body);
                this.insertModel = new InsertMetaModel(json);
                this.makeObjctToArray(this.instanceAttributes);
            }.bind(this));
        } else {
            this.np.serverMetaGet(function(response) {
                if (!response || !response._body) {
                    return;
                }
                const json = JSON.parse(response._body);
                this.insertModel = new InsertMetaModel(json);
                this.makeObjctToArray(this.instanceAttributes);
                this.sendDataToParent(); // Send init data to parent. Will be empty else.
            }.bind(this));
        }
    };


    public sendDataToParent() {
        var body = this.makeArrayToObject(
            this.attributes_mandatory,
            this.attributes
        );
        body.app_status = "open";
        body.server_name = this.server_name;
        this.onDataChange.emit(body);
    };
};