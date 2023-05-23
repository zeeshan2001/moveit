/**
 *	Just model used on login screen/form.
 */
export class LoginModel {
	public username: string = "";
	public password: string = "";
	public language: string = "";


	public constructor(response: any) {
		this.username = response.username;
		this.password = response.password;
		this.language = response.language;
	};
};