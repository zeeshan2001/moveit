import { Component, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '../../../translate/translate.service';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../../classes/network.class';
import { HTTPCode } from '../../../models/HTTPCodeModel';
declare var $: any;


@Component({
    selector: 'form-moveserver',
    templateUrl: './moveserver.view.html',
    styleUrls: ['./moveserver.style.scss']
})


export class MoveServerComponent implements AfterViewInit {
    @Input() itemName: string = "";
    @Input() category: string = "application";
    // Containing array of new_name and old_name.
    @Input() itemWorkflow: any[] = [];
    @Output() contentChange: EventEmitter<any[]> = new EventEmitter<any[]>();
    public np: NetworkPackage = null;
    // Suggestions
    public serverList: string[] = [];
    // Server list which contains an app
    public appServers: any[] = [];


    public constructor(private _translate: TranslateService, private http: Http, private cdRef:ChangeDetectorRef) {
         this.np = new NetworkPackage(http);
    };

    // Without this, there's a weird Angular bug. Don't remove this part.
    public ngAfterViewChecked() {
        this.cdRef.detectChanges();
    };


    /**
     *  Redirecting change to parent component
     *  @param index of current item. We get this from UI (ngFor)
     *  @param $event which contains the change itself.
     */
    public contentChanged(index, $event) {
        this.itemWorkflow[index].new_name = $event;
        this.contentChange.emit(this.itemWorkflow);
    }


    // Init. Start here.
    public ngAfterViewInit() {
        this.getAvailableServer();

        if (this.itemName && this.itemName !== "") {
            this.getAvailableServerForInstance();
        }
    };


    /**
     *  Getting servers which are migrated as a group.
     *  For e.g. if an app runs on multiple servers.
     *  If it's a server then it's just itself. :)
     */
    public getAvailableServerForInstance() {
        if (this.category === "server") {
            return this.initWorkflowSelf();
        }
        this.np.applicationServersGet(this.itemName, "all", function(response) {
            if (!response || !response._body) {
                return;
            }
            const json = JSON.parse(response._body);
            this.initExistingWorkflow(this.itemWorkflow, json);
            this.appServers = json;
        }.bind(this));
    };


    /**
     *  A server can't run on other serves.
     *  So migation is a singleton. This is what we're doing here.
     *  For applications we use initExistingWorkflow()
     */
    private initWorkflowSelf() {
        const obj = {
            old_name: this.itemName,
            new_name: this.itemName
        };
        this.itemWorkflow = [];
        this.itemWorkflow.push(obj);
    };


    /**
     *  Initing existing workflow and empty fields if not existing.
     *  @param workflow array of containing old and new names.
     *  @param serverList containing server with that app.
     */
    public initExistingWorkflow(workflow, serverList) {
        if (!workflow) {
            workflow = [];
        }
        var flow = [];
        
        for (var i = 0; i < serverList.length; i++) {
            var obj: {old_name: string, new_name: string} = {
                old_name: serverList[i].name,
                new_name: ""
            }
            // Does current/old workflow contain that field?
            for (var j = 0; j < workflow.length; j++) {
                if (workflow[j].old_name === obj.old_name) {
                    obj.new_name = workflow[j].new_name || "";
                }
            }
            if (obj.new_name.trim() === "") {
                obj.new_name = obj.old_name;
            }
            flow.push(obj);
        }
        this.itemWorkflow = flow;
    };


    /**
     *  Getting available server names for suggesting them to the user.
     *  We use it here to load them once instead of for every field.
     */
    public getAvailableServer() {
        this.np.serverFieldGet("name", function(response) {
            if (!response || !response._body) {
                return;
            }
            const json = JSON.parse(response._body);
            this.serverList = [];

            for (var i = 0; i < json.length; i++) {
                this.serverList.push(json[i]);
            }
        }.bind(this));
    };
};