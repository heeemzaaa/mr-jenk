import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./shared/components/header/header";
import { ToastContainer } from "./shared/components/toast-container/toast-container";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
