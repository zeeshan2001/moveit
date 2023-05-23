import { InjectionToken } from '@angular/core';
//import { LANG_EN_NAME, LANG_EN_TRANS } from './lang/lang-en';
import { LANG_DE_NAME, LANG_DE_TRANS } from './lang/lang-de';


export const TRANSLATIONS = new InjectionToken('translation');


export const dictionary = {
    // [LANG_EN_NAME]: LANG_EN_TRANS,
    [LANG_DE_NAME]: LANG_DE_TRANS
};


export const TRANSLATION_PROVIDERS = [{
	provide: TRANSLATIONS,
	useValue: dictionary
}];