import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { EditorService } from '../../services/editor.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { icons } from '../../consts/icons';
import { selectors } from '../../consts/selectors';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
  ],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  selectedItem$ = this.editorService.selectedItem$;
  form: FormGroup;
  chosenIcon = '';
  chosenSelector = '';

  icons = icons;
  selectors = selectors;

  constructor(
    private fb: FormBuilder,
    private editorService: EditorService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: [''],
      description: [''],
      icon: [''],
      selector: [''],
    });
  }

  ngOnInit() {
    this.selectedItem$.pipe(takeUntil(this.unsubscribe$)).subscribe((item) => {
      if (item) {
        this.form.patchValue({
          name: item.data.name,
          description: item.data.description,
          icon: item.data.icon,
          selector: item.data.selector,
        });
        this.chosenIcon = item.data.icon;
        this.chosenSelector = item.data.selector;
      } else {
        this.resetFields();
      }
      this.cdr.markForCheck();
    });

    this.form.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.save();
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  resetFields() {
    this.form.reset({
      name: '',
      description: '',
      icon: '',
      selector: '',
    });
    this.chosenIcon = '';
    this.chosenSelector = '';
    this.cdr.markForCheck();
  }

  selectIcon(icon: string) {
    this.form.get('icon')?.setValue(icon);
    this.chosenIcon = icon;
    this.cdr.markForCheck();
  }

  selectColor(selector: string) {
    this.form.get('selector')?.setValue(selector);
    this.chosenSelector = selector;
    this.cdr.markForCheck();
  }

  save() {
    this.editorService.updateItem(this.form.value);
    this.cdr.markForCheck();
  }
}
