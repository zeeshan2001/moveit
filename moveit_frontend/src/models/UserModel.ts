/**
 *	User model.
 */
export class UserModel {
	public _id: string = "";
	public email: string = "";
	public firstname: string = "";
	public lastname: string = "";


	public constructor(response: any) {
		this._id = response._id;
		this.email = response.email;
		this.firstname = response.firstname;
		this.lastname = response.lastname;
	};
};