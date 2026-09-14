import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from 'src/components/header/header';
import { Sidebar } from 'src/components/sidebar/sidebar';

@Component({
  selector: 'app-default-layout',
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './default-layout.html',
  styleUrl: './default-layout.css',
})
export class DefaultLayout {}
