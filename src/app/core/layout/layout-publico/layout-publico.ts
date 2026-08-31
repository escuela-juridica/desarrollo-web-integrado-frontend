import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FooterPublico } from '../footer-publico/footer-publico';

@Component({
  selector: 'app-layout-publico',
  imports: [RouterOutlet, RouterLink, FooterPublico],
  templateUrl: './layout-publico.html',
  styleUrl: './layout-publico.scss',
})
export class LayoutPublico {}
