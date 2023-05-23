export class FileModel {
    public _id: string = "";
    public name: string = "";
    public status: string = "";
    public createdAt: string = "";
    public updatedAt: string = "";
    public owner: string = "";
    public draft: boolean = false;
    public sheets: any[] = [];


    public constructor(response: any) {
        this._id = response._id;
        this.name = response.name;
        this.status = response.status;
        this.createdAt = response.createdAt;
        this.updatedAt = response.updatedAt;
        this.owner = response.owner;
        this.sheets = response.sheets;
        this.draft = response.draft;
    };
};