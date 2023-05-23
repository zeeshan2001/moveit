export class CommentModel {
    public _id: string = "";
    public user_id: string = "";
    public username: string = "";
    public message: string = "";
    public reference: string = "";
    public updatedAt: string = "";
    public createdAt: string = "";


    public constructor(response: any) {
        this._id = response._id;
        this.user_id = response.user_id;
        this.username = response.username || "";
        this.createdAt = response.createdAt || null;
        this.updatedAt = response.updatedAt || null;
        this.message = response.message || "";
        this.reference = response.reference || "";
    };
};