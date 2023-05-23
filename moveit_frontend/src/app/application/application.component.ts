import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '../../translate/translate.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoginModel } from '../../models/LoginModel';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../classes/network.class';
import { Config } from '../../app/config';
import { AppMetaModel } from '../../models/AppMetaModel';
import { InstanceModel } from '../../models/InstanceModel';
import { HTTPCode } from '../../models/HTTPCodeModel';


@Component({
  selector: 'app-application',
  templateUrl: './application.view.html',
  styleUrls: ['./application.style.scss']
})


export class ApplicationComponent {
    public np: NetworkPackage = null;
    public apps: AppMetaModel[] = [];
    public chosenFilter = "open";
    public tableIndex: number = -1;
    public chosenApp: {app_name: string, instances: InstanceModel[]} = {
        app_name: "",
        instances: []
    };
    public server: InstanceModel = null;


    public constructor(private _translate: TranslateService,
            private router: Router, private http: Http, private route: ActivatedRoute) {
        this.np = new NetworkPackage(http);

        this.route.params.subscribe(function(params) {
            if (params.status) {
                this.changeFilter(params.status);
            } else {
                this.changeFilter('open');
            }
        }.bind(this));
    };


    public getApplications() {
        this.np.applicationsGet(function(response) {
            if (!response) {
                return;
            }
            this.apps = [];

            response = JSON.parse(response._body);            
            for (var i = 0; i < response.length; i++) {
                this.apps.push(new AppMetaModel(response[i]));
            }
        }.bind(this));
    };


    public applyChanges() {
        this.getServer(this.server._id);
        this.chooseApplication(this.tableIndex);
    };


    public applyChangesById($event) {
        this.getServer($event);
        this.changeFilter("open");
    }


    public chooseApplication(index) {
        this.tableIndex = index;
        var obj = this.apps[index].app_name;
        this.chosenApp.app_name = obj;
        this.chosenApp.instances = [];
        const filter = this.chosenFilter;

        this.np.applicationServersGet(obj, "all", function(response) {
            if (!response || !response._body) {
                return;
            }
            switch (response.status) {
                case HTTPCode.NOT_FOUND: {
                    break;
                }
                case HTTPCode.OK: {
                    var instances = JSON.parse(response._body);
                    for (var i = 0; i < instances.length; i++) {
                        this.chosenApp.instances.push(
                            new InstanceModel(instances[i])
                        );
                    }
                    break;
                }
            }
        }.bind(this));
    };


    public closeServer() {
        this.server = null;
    };


    /**
     *  Getting server by the index from the server list.
     *  @param index of this.servers
     */
    public getServer(_id) {
        this.np.serverGet(_id, function(response) {
            if (!response || response.status === HTTPCode.NOT_FOUND || !response._body) {
                return;
            }
            var server = JSON.parse(response._body);
            this.server = new InstanceModel(server);
        }.bind(this));
    };


    public serverUpdated($event) {
        this.getServer(this.server._id);
        this.changeFilter(this.server.status);
        if (!$event.servicename || $event.servicename === "") {
            $event.servicename = this.chosenApp.app_name;
        }

        this.np.applicationServersGet($event.servicename, "all", function(response) {
            if (!response || !response._body) {
                return;
            }
            switch (response.status) {
                case HTTPCode.NOT_FOUND: {
                    break;
                }
                case HTTPCode.OK: {
                    var instances = JSON.parse(response._body);
                    this.chosenApp.instances = [];
                    for (var i = 0; i < instances.length; i++) {
                        this.chosenApp.instances.push(
                            new InstanceModel(instances[i])
                        );
                    }
                    break;
                }
            }
        }.bind(this));
    };


    public changeFilter(filter) {
        this.tableIndex = -1;
        this.chosenFilter = filter;
        this.router.navigateByUrl('app/status/' + filter);
        this.np.applicationsStatusGet(filter, function(response) {
            if (!response) {
                return;
            }
            this.apps = [];

            response = JSON.parse(response._body);
            for (var i = 0; i < response.length; i++) {
                this.apps.push(new AppMetaModel(response[i]));
            }
        }.bind(this));
    };
};