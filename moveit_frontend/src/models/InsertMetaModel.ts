export class InsertMetaModel {
    public mandatory: string[];
    public key: string;


    public constructor(response: any) {
        this.mandatory = response.mandatory || [];
        this.key = response.key;
    };
};