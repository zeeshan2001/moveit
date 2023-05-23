import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '../../translate/translate.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoginModel } from '../../models/LoginModel';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../classes/network.class';
import { Config } from '../../app/config';
import { HTTPCode } from '../../models/HTTPCodeModel';


@Component({
  selector: 'app-login',
  templateUrl: './login.view.html',
  styleUrls: ['./login.style.scss']
})


/**
 *  Class for managing the login screen.
 *  This page can be visited if user hasn't any valid session.
 */
export class LoginComponent {
    public error_message: string = "";
    public attempting: boolean = false;
    public login_data: LoginModel = new LoginModel({
        username: "",
        password: "",
        language: ""
    });
    public np: NetworkPackage = null;
    public languageList: any = [];


    /**
     *  Constructor. Init code as usual.
     *  Redirecting user if with a token to dash.
     */
    public constructor(private _translate: TranslateService,
            private router: Router, private http: Http) {
        
        if (Cookie.get('jwt')) {
            this.router.navigateByUrl('/');
            return;
        }
        
        // Init language list and set default.
        Config.langs.forEach(function (langObj) {
            this.languageList.push(langObj);
        }, this);
        this.login_data.language = Config.default_lang;
        
        this.np = new NetworkPackage(http);
    };


    /**
     *  Login attempt to backend.
     *  @param data should be same as this.login_data
     *  @return if succeeded then redirecting to dash
     */
    public loginAttempt(data): void {
        this.attempting = true;

        this.np.userSessionPost(this.login_data, function(response) {
            if (!response) {
                return
            }
            this.handleResponse(response);
            this.attempting = false;
        }.bind(this));
    };


    /**
     *  Helper method for handling response HTTP codes.
     *  @param response including all data of response. Status + body.
     */
    private handleResponse(response): void {
        switch (response.status) {
            case HTTPCode.ACCEPTED: {
                this.createSession(JSON.parse(response._body));
                break;
            }
            case HTTPCode.UNAUTHORIZED: {
                this.error_message = this._translate.instant('invalid_login_creds');
                break;
            }
            case HTTPCode.NOT_FOUND: {
                this.error_message = this._translate.instant('user_not_found');
                break;
            }
            case HTTPCode.NOT_ACCEPTABLE: {
                this.error_message = this._translate.instant('invalid_login_creds');
                break;
            }
            default: {
                this.error_message = this._translate.instant('unknown_error');
                break;
            }
        }
    };


    /**
     *  Creating session here. Helper method.
     *  @param json encoded response body.
     */
    private createSession(json): void {
        Cookie.set("jwt", json.session, 3560);
        this.router.navigateByUrl('');
    };
};