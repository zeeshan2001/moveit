import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '../translate/translate.service';


@Component({
	selector: 'app-root',
	template: `<div>
		<router-outlet></router-outlet>
	</div>`,
})


/**
 *	Main class. We're setting the language here.
 */
export class AppComponent {
	constructor(private _translate: TranslateService, private router: Router) {
		switch(navigator.language) {
			case 'de' : {
				_translate.use('de');
				break;
			}
			default: {
				_translate.use('de');
				break;
			}
		}
	}
}