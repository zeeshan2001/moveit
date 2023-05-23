import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '../../translate/translate.service';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { LoginModel } from '../../models/LoginModel';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../classes/network.class';
import { Config } from '../../app/config';
import { SocketService } from '../../classes/socket.service';
import { HistoryModel } from '../../models/HistoryModel';


@Component({
    selector: 'app-history',
    templateUrl: './history.view.html',
    styleUrls: ['./history.style.scss']
})


export class HistoryComponent {
    public np: NetworkPackage = null;
    public progressApplications = [1, 0, 0];
    public progressServer = [1, 0, 0];
    public completeApplications = [1, 0, 0];
    public completeServer = [1, 0, 0];
    public progressComponents = [1, 0, 0];
    public completeComponents = [1, 0, 0];
    public history: HistoryModel[] = [];


    public constructor(private _translate: TranslateService,
            private router: Router, private http: Http,
            private socketService:SocketService, private _cookieService: CookieService) {
        this.np = new NetworkPackage(http);
        this.getApplicationsSummary();
        this.getServersSummary();
        this.getComponentSummary();
        this.getLatestHistory();
    };


    public getLatestHistory() {
        this.np.historyGet(0, 5, function(response) {
            if (!response || !response._body) {
                return;
            }
            var histories = JSON.parse(response._body);
            for (var i = 0; i < histories.length; i++) {
                this.history.push(histories[i]);
            }
        }.bind(this));
    };


    public getApplicationsSummary() {
        this.np.applicationsSummaryGet(function(response) {
            if (!response || !response._body) {
                return;
            }
            var summary = JSON.parse(response._body);
            this.progressApplications = [
                summary.open + summary.done,
                summary.progress | 0,
                summary.done | 0
            ];

            this.completeApplications = [
                summary.open + summary.progress + summary.done,
                0,
                summary.valid | 0
            ];
        }.bind(this));
    };


    public getServersSummary() {
        this.np.serversSummaryGet(function(response) {
            if (!response || !response._body) {
                return;
            }
            var summary = JSON.parse(response._body);
            this.progressServer = [
                summary.open + summary.done,
                summary.progress | 0,
                summary.done | 0
            ];

            this.completeServer = [
                summary.open + summary.progress + summary.done,
                0,
                summary.valid | 0
            ];
        }.bind(this));
    };


    public getComponentSummary() {
        this.np.componentsSummaryGet(function(response) {
            if (!response || !response._body) {
                return;
            }
            var summary = JSON.parse(response._body);
            this.progressComponents = [
                summary.open + summary.done,
                summary.progress | 0,
                summary.done | 0
            ];

            this.completeComponents = [
                summary.open + summary.progress + summary.done,
                0,
                summary.valid | 0
            ];
        }.bind(this));
    };


    /**
     *  Getting event from angular charts
     *  @param chartType: server, app, component
     *  @param index 0, 1 or 2 for open progress done.
     */
    public handleChartClickEventProgress(chartType, index) {
        switch (index) {
            case 0: {
                this.router.navigateByUrl('/' + chartType + '/status/open');
                return;
            }
            case 1: {
                this.router.navigateByUrl('/' + chartType + '/status/progress');
                return;
            }
            case 2: {
                this.router.navigateByUrl('/' + chartType + '/status/done');
                return;
            }
        }
    };
};
