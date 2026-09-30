import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Carousel } from './carousel';

describe('Carousel', () => {
  let fixture: ComponentFixture<Carousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carousel],
    }).compileComponents();

    fixture = TestBed.createComponent(Carousel);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render no image when none are provided', () => {
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('.app-carousel-image');
    expect(img).toBeNull();
  });

  it('should show the first provided image initially', () => {
    fixture.componentRef.setInput('images', ['a.jpg', 'b.jpg', 'c.jpg']);
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('.app-carousel-image');
    expect(img.src).toContain('a.jpg');
  });

  it('should move to the next image and wrap around', () => {
    fixture.componentRef.setInput('images', ['a.jpg', 'b.jpg']);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.app-carousel-arrow-next').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.app-carousel-image').src).toContain('b.jpg');

    fixture.nativeElement.querySelector('.app-carousel-arrow-next').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.app-carousel-image').src).toContain('a.jpg');
  });

  it('should move to the previous image and wrap around', () => {
    fixture.componentRef.setInput('images', ['a.jpg', 'b.jpg']);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.app-carousel-arrow-prev').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.app-carousel-image').src).toContain('b.jpg');
  });

  it('should jump to an image when its dot is clicked', () => {
    fixture.componentRef.setInput('images', ['a.jpg', 'b.jpg', 'c.jpg']);
    fixture.detectChanges();

    const dots: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('.app-carousel-dot');
    dots[2].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.app-carousel-image').src).toContain('c.jpg');
  });

  it('should not show arrows or dots for a single image', () => {
    fixture.componentRef.setInput('images', ['a.jpg']);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.app-carousel-arrow-next')).toBeNull();
    expect(fixture.nativeElement.querySelector('.app-carousel-dot')).toBeNull();
  });
});
