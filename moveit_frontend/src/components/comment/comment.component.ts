import { Component, Input } from '@angular/core';
import { TranslateService } from '../../translate/translate.service';
import { CommentModel } from '../../models/CommentModel';   


@Component({
  selector: 'user-comment',
  templateUrl: './comment.view.html',
  styleUrls: ['./comment.style.scss']
})


export class CommentComponent {
    @Input() comment: CommentModel = new CommentModel({});

    public constructor(private _translate: TranslateService) {

    };
};