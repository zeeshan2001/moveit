import { PipeTransform } from '@angular/core';


export class ArraySortPipe implements PipeTransform {
    transform(array: Array<any>): Array<string> {
        array.sort((a: any, b: any) => {
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            } else {
                return 0;
            }
        });
        return array;
    }
}