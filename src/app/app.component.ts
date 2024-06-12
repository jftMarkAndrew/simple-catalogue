import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from './components/menu/menu.component';
import { EditorComponent } from './components/editor/editor.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, MenuComponent, EditorComponent, ScrollingModule],
})
export class AppComponent {
  title = 'simple-catalogue';
}
