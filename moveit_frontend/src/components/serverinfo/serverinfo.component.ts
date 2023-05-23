import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { InstanceModel } from '../../models/InstanceModel';
import { TranslateService } from '../../translate/translate.service';
import { Http } from '@angular/http';
import {FormControl} from '@angular/forms';
import { NetworkPackage } from '../../classes/network.class';
import { HTTPCode } from '../../models/HTTPCodeModel';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import swal from 'sweetalert2/dist/sweetalert2.js'
declare var $: any;


@Component({
    selector: 'server-info',
    templateUrl: './serverinfo.view.html',
    styleUrls: ['./serverinfo.style.scss']
})


export class ServerinfoComponent implements OnChanges {
    @Input() server: InstanceModel = new InstanceModel({});
    @Output() notifyParent: EventEmitter<any> = new EventEmitter<any>();
    public Object = Object;
    public np: NetworkPackage = null;
    public comment_compose: {message: string, reference: string} = {message: "", reference: ""}
    public currentFlagItem: any = {obj: {}, type: ""};
    serverAttributes: any = {};


    public constructor(public _translate: TranslateService, public http: Http,
    public cdRef: ChangeDetectorRef, public toasterService: ToasterService) {
        this.np = new NetworkPackage(http);
    };


    /**
     *  Removing current server from system.
     *  Showing confirmation popup to the user.
     */
    public removeServer() {
        swal({
            title: this._translate.instant('confirm_action'),
            text: this._translate.instant('delete_instance_text'),
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: this._translate.instant('yes'),
            cancelButtonText: this._translate.instant('no')
        }).then((result) => {
            if (result.value) {
                this.requestDeletion(this.server._id);
            }
        });
    };


    public ngOnChanges(changes: SimpleChanges) {
        if ('server' in changes) {
           this.serverAttributes = Object.keys(this.server.attributes);
        }
        this.resetCommentField();
        this.cdRef.detectChanges();
    };


    /**
     *  Sending request to server to delete given server id.
     *  @param server_id of current server which is stored in 'this.server'.
     */
    public requestDeletion(server_id) {
        this.np.serverDelete(server_id, function(response) {
            if (!response) {
                return;
            }

            switch (response.status) {
                case HTTPCode.OK: {
                    this.notifyParentFunction({});
                    break;
                }
                default: {
                    console.log("Unknwon error. Response: " + JSON.stringify(response));
                    break;
                }
            }
        }.bind(this));
    };


    /**
     *  Telling parent component to update list.
     *  E.g. after deleting an instance.
     */
    public notifyParentFunction($event) {
        this.notifyParent.emit($event);
    };


    /**
     *  Setting name for reference
     *  @param ref_name is the name we want to set
     */
    public setReference(ref_name) {
        this.comment_compose.reference = ref_name;
    };


    /**
     *  Resetting the comment field and reference name
     *  Used e.g. when detecting changes.
     */
    public resetCommentField() {
        this.comment_compose = {
            message: "",
            reference: ""
        };
    };


    /**
     *  Updating current status of instance.
     *  @param $event: Getting workflow from child component
     */
    public onMigrate($event) {
        var body: any = {};
        body.server_id = this.server._id;

        if (this.currentFlagItem.type !== 'server') {
            body.item_name = this.currentFlagItem.obj.servicename;
        } else {
            this.server.workflow = $event;
        }
        body.workflow = $event;
        body.category = this.currentFlagItem.type;

        if (this.currentFlagItem.type === 'applications') {
            this.np.applicationWorkflowMigratePost(body, function(response) {
                if (response) {
                    if (response.status === HTTPCode.OK
                            || response.status === HTTPCode.NOT_ACCEPTABLE) {
                        var json;
                        try {
                            json = JSON.parse(response._body)
                        } catch (ex) {
                            console.log("Error, onMigrate():" + ex);
                        }

                        if (json.code === 1) {
                            this.toasterService.pop("error", '',
                                this._translate.instant("inventore_all_app_servers"));
                            return;
                        } else if (json.code === 4) {
                            this.toasterService.pop("error", '',
                                this._translate.instant("inventore_all_apps"));
                            return;
                        }
                        this.notifyParentFunction(json);
                    }
                }
            }.bind(this));
        } else if (this.currentFlagItem.type === 'server') {
            this.np.serverWorkflowMigratePost(body, function(response) {
                if (response) {
                    if (response.status === HTTPCode.OK) {
                        try {
                            const json = JSON.parse(response._body)
                            this.notifyParentFunction(json);
                        } catch (ex) {
                            console.log("Error, onMigrate():" + ex);
                        }
                    }
                }
            }.bind(this));
        }
    };


    /**
     *  Action after clicking a flag
     *  @param type: e.g. server
     *  @param instanceName: name/id of current
     */
    public startMigration(type, instanceName) {

        // If server has any applications and was inventored
        // Then we're going to block this action since this server is
        // migrated using its applications.
        if (this.server && this.server.applications
            && this.server.applications.length > 0
            && type === "server" && this.server.inventory) {
            this.toasterService.pop("warning", '',
                this._translate.instant("has_applications_error"));
            return;
        } else if (type === "server" && (this.server.migrated
                    || this.server.status === "done")) {
            this.toasterService.pop("warning", '',
                this._translate.instant("migration_finished"));
            return;
        } else if (type == "applications" && instanceName.inventory
                    && !this.server.inventory) {
            this.toasterService.pop("warning", '',
                this._translate.instant("inventore_server_first"));
            return;
        }


        this.currentFlagItem.type = "";
        this.currentFlagItem.obj = "";
        this.cdRef.detectChanges();

        if (type == 'server') {
            $("#myModalServer").modal('show');
        } else if (type == 'applications') {
            $("#myModalApp").modal('show');
        }

        this.currentFlagItem = {
            type: type,
            obj: instanceName
        };
    };


    /**
     *  Submitting comment to current server/instance.
     */
    public submitComment() {
        this.np.commentPost(this.server._id, this.comment_compose, function(response) {
            if (response) {
                this.resetCommentField();
                this.notifyParentFunction({});
            }
        }.bind(this));
    }

    public changeAttribute(attribute, serverId, $event) {
      this.np.changeAttribute(attribute, serverId, $event.target.value);
    }
}
