import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FooterPublico } from '../footer-publico/footer-publico';

@Component({
  selector: 'app-layout-auth',
  imports: [RouterOutlet, RouterLink, FooterPublico],
  templateUrl: './layout-auth.html',
  styleUrl: './layout-auth.scss',
})
export class LayoutAuth {}
