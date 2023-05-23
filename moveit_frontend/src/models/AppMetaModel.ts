export class AppMetaModel {
    public count: string = "";
    public app_name: string = "";


    public constructor(response: any) {
        this.count = response.count;
        this.app_name = response.app_name;
    };
};