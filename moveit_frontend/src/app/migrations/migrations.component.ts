import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '../../translate/translate.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoginModel } from '../../models/LoginModel';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../classes/network.class';
import { Config } from '../../app/config';
import { InstanceModel } from '../../models/InstanceModel';
import { ComponentModel } from '../../models/ComponentModel';
import { ServerComponent } from '../server/server.component';
import { HTTPCode } from '../../models/HTTPCodeModel';


@Component({
    selector: 'app-migrations',
    templateUrl: './migrations.view.html',
    styleUrls: ['../server/server.style.scss']
})


export class MigrationsComponent extends ServerComponent {
    public chosenFilter = "server";
    public chosenApp = ""; // so we can get the server by app name
    public np: NetworkPackage;
    public migratedApps = [];


    public constructor(public _translate: TranslateService, public router: Router,
          public http: Http, public cref: ChangeDetectorRef, public route: ActivatedRoute) {
        super(_translate, router, http, cref, route);
        
        this.np = new NetworkPackage(this.http);

        this.route.params.subscribe(function(params) {
            if (params.type) {
                this.changeFilter(params.type);
            } else {
                this.changeFilter(this.chosenFilter);
            }
        }.bind(this));
    };


    public loadMigratedServer() {
        this.np.serversMigratedGet(function(response) {
            this.handleMigratedResult(response);
        }.bind(this));
    };


    public loadMigratedComponent() {
        this.np.componentsMigratedGet(function(response) {
            this.handleMigratedResult(response);
        }.bind(this));
    };


    public loadMigratedApp() {
        this.np.applicationsStatusGet("done", function(response) {
            if (!response || !response._body) {
                return;
            }
            this.migratedApps = [];
            response = JSON.parse(response._body);

            for (var i = 0; i < response.length; i++) {
                this.migratedApps.push(response[i]);
            }
        }.bind(this));
    };


    /**
     *  Choosing an application by index (migratedApps).
     *  @param index: migratedApps index
     */
    public chooseApplication(index) {
        const appName = this.migratedApps[index].app_name;

        this.np.applicationServersGet(appName, "done", function(response) {
            this.handleMigratedResult(response);
            this.chosenFilter = "server";
        }.bind(this));
    };


    // Helper method
    private handleMigratedResult(response) {
        if (!response || !response._body) {
            return;
        }
        this.servers = [];
        response = JSON.parse(response._body);

        for (var i = 0; i < response.length; i++) {
            response[i].attributes_length = Object.keys(response[i].attributes).length;
            this.servers.push(new InstanceModel(response[i]));
        }
    };


    /**
     *  Sincde we manage three types we add a new function for this.
     *  @param tableIndex index from table
     */
    public getItem(tableIndex) {
        switch (this.chosenFilter) {
            case "server": {
                this.getServer(tableIndex);
                break;
            }
            case "components": {
                this.np.componentGet(this.servers[tableIndex]._id, function(response) {
                    if (!response || response.status === HTTPCode.NOT_FOUND || !response._body) {
                        return;
                    }
                    var server = JSON.parse(response._body);
                    this.server = new ComponentModel(server);
                }.bind(this));
                break;
            }
            case "apps": {
                break;
            }
        }
    };


    /**
     *  Add this to override this method to avoid loading other server.
     *  Use loadMigratedServer instead.
     */
    public changeFilter(filter) {
        this.chosenFilter = filter;
        this.router.navigateByUrl('migration/' + filter);
        this.server = null;
        this.tableIndex = -1;
        
        switch (filter) {
            case "components": {
                this.loadMigratedComponent();
                break;
            }
            case "apps": {
                this.loadMigratedApp();
                break;
            }
            default: {
                this.loadMigratedServer();
                break;
            }
        }
    };


    /**
     *  Same: Since we manage three items we manage them here.
     *  Just updating current shown item.
     */
    public reload() {
        switch (this.chosenFilter) {
            case "server": {
                this.reloadServer();
                break;
            }
            case "components": {
                break;
            }
            case "apps": {
                break;
            }
        }
    };
};