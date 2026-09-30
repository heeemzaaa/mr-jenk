import { Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.html',
  styleUrl: './carousel.css',
})
export class Carousel {
  images = input<string[]>([]);
  alt = input('Product image');
  height = input('180px');

  readonly currentIndex = signal(0);

  readonly slides = computed(() => this.images());
  readonly hasMultiple = computed(() => this.slides().length > 1);

  readonly activeImage = computed(() => {
    const slides = this.slides();

    if (!slides.length) {
      return null;
    }

    const index = ((this.currentIndex() % slides.length) + slides.length) % slides.length;
    return slides[index];
  });

  next(): void {
    const total = this.slides().length;
    this.currentIndex.update((i) => (i + 1) % total);
  }

  prev(): void {
    const total = this.slides().length;
    this.currentIndex.update((i) => (i - 1 + total) % total);
  }

  goTo(index: number): void {
    this.currentIndex.set(index);
  }
}
