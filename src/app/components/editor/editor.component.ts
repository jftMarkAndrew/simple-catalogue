import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorService } from '../../services/editor.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
  ],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();

  selectedItem$ = this.editorService.selectedItem$;
  name = '';
  description = '';
  icon = '';
  selector = '';
  chosenIcon = '';
  chosenSelector = '';

  icons = [
    'home',
    'work',
    'school',
    'star',
    'favorite',
    'circle',
    'autorenew',
    'bolt',
  ];

  selectors = [
    'white',
    '#f1f2f7',
    'lightblue',
    '#DDFFE7',
    '#F9F1F0',
    'lightyellow',
    '#FADCD9',
    '#F6EEE0',
  ];

  constructor(private editorService: EditorService) {
    this.selectedItem$.pipe(takeUntil(this.unsubscribe$)).subscribe((item) => {
      if (item) {
        this.name = item.data.name;
        this.description = item.data.description;
        this.icon = item.data.icon;
        this.selector = item.data.selector;
        this.chosenIcon = item.data.icon;
        this.chosenSelector = item.data.selector;
      } else {
        this.name = '';
        this.description = '';
        this.icon = '';
        this.selector = '';
        this.chosenIcon = '';
        this.chosenSelector = '';
      }
    });
  }

  selectIcon(icon: string) {
    this.icon = icon;
    this.save();
    this.chosenIcon = icon;
  }

  selectColor(selector: string) {
    this.selector = selector;
    this.save();
    this.chosenSelector = selector;
  }

  save() {
    this.editorService.updateItem({
      name: this.name,
      description: this.description,
      icon: this.icon,
      selector: this.selector,
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
