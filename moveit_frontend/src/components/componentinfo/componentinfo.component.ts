import { Component, Input, Output, EventEmitter,
        OnChanges, ChangeDetectorRef } from '@angular/core';
import { InstanceModel } from '../../models/InstanceModel';
import { TranslateService } from '../../translate/translate.service';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../classes/network.class';
import { HTTPCode } from '../../models/HTTPCodeModel';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { ServerinfoComponent } from '../serverinfo/serverinfo.component';
import swal from 'sweetalert2/dist/sweetalert2.js'
declare var $: any;


@Component({
    selector: 'component-info',
    templateUrl: './componentinfo.view.html',
    styleUrls: ['./componentinfo.style.scss']
})


export class ComponentInfo extends ServerinfoComponent implements OnChanges {
    @Input() server: InstanceModel = new InstanceModel({});
    @Output() notifyParent: EventEmitter<any> = new EventEmitter<any>();

    public constructor(public _translate: TranslateService, public http: Http,
        public cdRef: ChangeDetectorRef, public toasterService: ToasterService) {
        super(_translate, http, cdRef, toasterService);
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
                    console.log("Unknwon error. Response: "
                        + JSON.stringify(response));
                    break;
                }
            }
        }.bind(this));
    };


    /**
     *  Updating current status of instance.
     *  @param $event: Getting workflow from child component
     */
    public onMigrate($event) {
        var body: any = {};
        body.server_id = this.server._id;

        this.server.workflow = $event;
        body.workflow = $event;
        body.category = this.currentFlagItem.type;

        this.np.componentWorkflowMigratePost(body, function(response) {
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
    };


    /**
     *  Submitting comment to current server/instance.
     */
    public submitComment() {
        this.np.componentCommentPost(this.server._id, this.comment_compose,
                function(response) {
            if (response) {
                this.resetCommentField();
                this.notifyParentFunction({});
            }
        }.bind(this));
    };
};