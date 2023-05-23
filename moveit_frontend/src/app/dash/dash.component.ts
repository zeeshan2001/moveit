import { Component, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '../../translate/translate.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../classes/network.class';
import { Shared } from '../../classes/shared.singleton';
import { UserModel } from '../../models/UserModel';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import Swal from 'sweetalert2'
import { SocketService } from '../../classes/socket.service';


@Component({
    selector: 'app-dash',
    templateUrl: './dash.view.html',
    styleUrls: ['./dash.style.scss'],
    providers: [SocketService]
})


/**
 *  Main component of dash. Controlling everything here.
 */
export class DashComponent {
    private np: NetworkPackage = null;
    public user: UserModel = null;
    public showLoader: boolean = false;
    private toasterService: ToasterService;


    public constructor(private _translate: TranslateService, toasterService: ToasterService,
            private router: Router, private http: Http, private _shared: Shared, private socketService:SocketService) {

        if (!Cookie.get('jwt')) {
            this.router.navigateByUrl('login');
        }
        
        this.toasterService = toasterService;
        this.np = new NetworkPackage(http);
        this.getUserSelf();
    };


    public handleBroadcast(message) {
        console.log("BROADCAST: " + message);
    };


    public toggleLoader() {
        this.showLoader = !this.showLoader;
    };


    /**
     *  Showing notification
     */
    public showToast(title, message, type) {
        this.toasterService.pop(type, title, message);
    };


    /**
     *  Get user from backend if didn't before.
     */
    public getUserSelf() {
        if (!this._shared.user) {
            this.np.userGet(function(response) {
                if (!response) {
                    return;
                }
                switch (response.status) {
                    case 200: {
                        var body = JSON.parse(response._body);
                        if (!body.firstname) {
                            body.firstname = "";
                        }
                        if (!body.lastname) {
                            body.lastname = "";
                        }
                        this._shared.user = new UserModel(body);
                        this.showToast(
                            '',
                            this._translate.instant('logged_in_as')+": "+body.firstname+" "+body.lastname,
                            'info'
                        );
                        break;
                    }
                    case 404: case 406: {
                        Cookie.deleteAll();
                        this.router.navigateByUrl("/login");
                        break;
                    }
                    default: {
                    }
                }
            }.bind(this));
        }
    };
};