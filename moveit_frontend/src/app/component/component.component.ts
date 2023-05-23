import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '../../translate/translate.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoginModel } from '../../models/LoginModel';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../classes/network.class';
import { Config } from '../../app/config';
import { ServerComponent } from '../server/server.component';
import { ComponentModel } from '../../models/ComponentModel';
import { HTTPCode } from '../../models/HTTPCodeModel';


@Component({
  selector: 'app-component',
  templateUrl: './component.view.html',
  styleUrls: ['../server/server.style.scss']
})


export class ComponentComponent extends ServerComponent {
    public constructor(public _translate: TranslateService, private aRouter: ActivatedRoute,
            public router: Router, public http: Http, public cref: ChangeDetectorRef) {
        super(_translate, router, http, cref, aRouter);
    };


    public changeFilter(filter) {
        this.tableIndex = -1;
        this.chosenFilter = filter;
        this.router.navigateByUrl('component/status/' + filter);
        this.np.componentsStatusGet(filter, function(response) {
            if (!response) {
                return;
            }
            this.servers = [];

            response = JSON.parse(response._body);
            
            for (var i = 0; i < response.length; i++) {
                response[i].attributes_length = Object.keys(response[i].attributes).length;
                this.servers.push(new ComponentModel(response[i]));
            }
        }.bind(this));
    };


    /**
     *  Override
     */
    public getServer(index) {
        this.tableIndex = index;
        this.np.componentGet(this.servers[index]._id, function(response) {
            if (!response || response.status === HTTPCode.NOT_FOUND || !response._body) {
                return;
            }
            var server = JSON.parse(response._body);
            this.server = new ComponentModel(server);
        }.bind(this));
    };


    /**
     *  Override
     */
    public getServerById(ID, callback) {
        this.np.componentGet(ID, function(response) {
            if (!response || response.status === HTTPCode.NOT_FOUND || !response._body) {
                return;
            }
            var server = JSON.parse(response._body);
            this.server = new ComponentModel(server);
            this.tableIndex = -1;
            this.chosenFilter = this.server.status;
            callback(this.server);
        }.bind(this));
    };
};