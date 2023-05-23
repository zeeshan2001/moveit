import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '../../translate/translate.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoginModel } from '../../models/LoginModel';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../classes/network.class';
import { Config } from '../../app/config';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.view.html',
  styleUrls: ['./menu.style.scss']
})


/**
 *  Managing the main menu.
 *  Mostly routing and catching UI events.
 */
export class MenuComponent {
    /**
     *
     */
    public constructor(private _translate: TranslateService,
            private router: Router, private http: Http) {
        
    };


    /**
     *  Getting and handling the name of clicked menu item.
     *  @param url of clicked menu item
     *  @return routing, nothing to do
     */
    public menuClickHandler(url): void {
        switch (url) {
            case 'logout': {
                Cookie.deleteAll();
                this.router.navigateByUrl("/login");
                break;
            }
            default: {
                this.router.navigateByUrl("/" + url);
                break;
            }
        }
        return;
    };
};