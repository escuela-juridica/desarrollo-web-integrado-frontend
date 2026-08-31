import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Swiper } from 'swiper/types';

/** Fotos del carrusel del hero (PF-001). Mismas 3 del prototipo, servidas localmente. */
const HERO_IMGS = ['img/catalogo/hero-1.jpg', 'img/catalogo/hero-2.jpg', 'img/catalogo/hero-3.jpg'];

@Component({
  selector: 'app-catalogo',
  imports: [RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Catalogo implements AfterViewInit {
  protected readonly heroImgs = HERO_IMGS;
  protected readonly heroIndexActivo = signal(0);

  private readonly heroSwiperRef = viewChild<ElementRef<HTMLElement & { swiper: Swiper; initialize(): void }>>('heroSwiper');

  async ngAfterViewInit(): Promise<void> {
    const swiperEl = this.heroSwiperRef()?.nativeElement;
    if (!swiperEl) return;

    // Import perezoso: Swiper solo pesa en esta pantalla, no en el bundle inicial.
    const { register } = await import('swiper/element/bundle');
    register();

    Object.assign(swiperEl, {
      loop: true,
      speed: 350,
      slidesPerView: 1,
      autoplay: { delay: 5000, disableOnInteraction: false },
    });
    swiperEl.initialize();
    swiperEl.addEventListener('swiperslidechange', () => {
      this.heroIndexActivo.set(swiperEl.swiper.realIndex);
    });
  }

  protected heroPrev(): void {
    this.heroSwiperRef()?.nativeElement.swiper.slidePrev();
  }

  protected heroNext(): void {
    this.heroSwiperRef()?.nativeElement.swiper.slideNext();
  }

  protected heroIrA(i: number): void {
    this.heroSwiperRef()?.nativeElement.swiper.slideToLoop(i);
  }
}
