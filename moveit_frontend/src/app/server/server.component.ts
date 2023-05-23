import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '../../translate/translate.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { InstanceModel } from '../../models/InstanceModel';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../classes/network.class';
import { Config } from '../../app/config';
import { HTTPCode } from '../../models/HTTPCodeModel';


@Component({
    selector: 'app-server',
    templateUrl: './server.view.html',
    styleUrls: ['./server.style.scss']
})


export class ServerComponent implements AfterViewInit {
    public np: NetworkPackage = null;
    public servers: InstanceModel[] = [];
    public server: InstanceModel = null;
    public tableIndex: number = -1;
    public chosenFilter: string = "open";
    public filterName: string = "name";
    public filterOrder: boolean = true;


    public ngAfterViewInit() {
        this.cref.detectChanges();
    };


    /**
     *  Filtering table column by a given attribute name
     *  Sorting the servers array by given name and order.
     *  @param name of the attribute
     *  @param compareLength if true instead of content
     */
    public filterTableByAttribute(attributeName: string, compareLength: boolean, attributeProperty: string) {
        if(attributeProperty) {
            if (attributeProperty === this.filterName) {
                this.filterOrder = !this.filterOrder;
            } else {
                this.filterOrder = true;
                this.filterName = attributeProperty;
            }
        }else {
            if (attributeName === this.filterName) {
                this.filterOrder = !this.filterOrder;
            } else {
                this.filterOrder = true;
                this.filterName = attributeName;
            }
        }

        // Sorting server columns by a given attribute
        this.servers.sort((a: any, b: any) => {
            if(attributeProperty) {
                a = a[attributeName][attributeProperty];
                b = b[attributeName][attributeProperty];
            }else {
                a = a[attributeName];
                b = b[attributeName];
            }
            if (compareLength) {
                a = a.length;
                b = b.length;
            }

            if (!this.filterOrder) {
                if (a > b) { return -1;} else
                if (a < b) { return 1;} else {return 0;}
            } else {
                if (a > b) { return 1;} else
                if (a < b) { return -1;} else {return 0;}
            }
        });
    };


    /**
     *  Constructor is checking and saving the given server id.
     */
    public constructor(public _translate: TranslateService, public router: Router,
          public http: Http, public cref: ChangeDetectorRef, public route: ActivatedRoute) {
        this.np = new NetworkPackage(http);

        this.route.params.subscribe(function(params) {
            if (params.status) {
                this.changeFilter(params.status);
            } else {
                this.changeFilter('open');
            }
        }.bind(this));
    };


    /**
     *  Getting all available servers
     *  If parameter has been set, then choose and load this server.
     */
    public getServers() {
        this.changeFilter(this.chosenFilter);

        if (this.tableIndex !== -1) {
            this.getServer(this.tableIndex);
        }
    };


    // Reloading 'current' server if user has chosen one before.
    public reloadServer() {
        if (!this.server) {
            return;
        }
        this.getServerById(this.server._id, function(server) {
            this.changeFilter(server.status);
        }.bind(this));
    };


    /**
     *  Getting the index of the server.
     *  @param id of server.
     *  @return ID or -1 if not
     */
    public getIndexById(id) {
        for (var i = 0; i < this.servers.length; i++) {
            if (this.servers[i]._id === id) {
                return i;
            }
        }
        return -1;
    };


    /**
     *  Getting server by the index from the server list.
     *  @param index of this.servers
     */
    public getServer(index) {
        this.tableIndex = index;
        this.np.serverGet(this.servers[index]._id, function(response) {
            if (!response || response.status === HTTPCode.NOT_FOUND || !response._body) {
                return;
            }
            var server = JSON.parse(response._body);
            this.server = new InstanceModel(server);
        }.bind(this));
    };


    /**
     *  Getting server by ID and not index.
     *  @param ID (_id) of the server.
     */
    public getServerById(ID, callback?) {
        this.np.serverGet(ID, function(response) {
            if (!response || response.status === HTTPCode.NOT_FOUND || !response._body) {
                return;
            }
            var server = JSON.parse(response._body);
            this.server = new InstanceModel(server);
            this.tableIndex = -1;
            this.chosenFilter = this.server.status;
            callback(this.server);
        }.bind(this));
    };


    /**
     *  Chaning filter by status.
     *  @param filter name: error, open, progress, done
     */
    public changeFilter(filter) {
        this.tableIndex = -1;
        this.chosenFilter = filter;
        this.router.navigateByUrl('server/status/' + filter);
        this.np.serversStatusGet(filter, function(response) {
            if (!response) {
                return;
            }
            this.servers = [];

            response = JSON.parse(response._body);

            for (var i = 0; i < response.length; i++) {
                response[i].attributes_length = Object.keys(response[i].attributes).length;
                this.servers.push(new InstanceModel(response[i]));
            }
        }.bind(this));
    };
};
