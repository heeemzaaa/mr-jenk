import { beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSpinner } from './loading-spinner';

describe('LoadingSpinner', () => {
  let fixture: ComponentFixture<LoadingSpinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinner],
    }).compileComponents();
    fixture = TestBed.createComponent(LoadingSpinner);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should default the label to "Loading…"', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.querySelector('p').textContent.trim();
    expect(text).toBe('Loading…');
  });

  it('should render a custom label when provided', () => {
    fixture.componentRef.setInput('label', 'Fetching products…');
    fixture.detectChanges();
    const text = fixture.nativeElement.querySelector('p').textContent.trim();
    expect(text).toBe('Fetching products…');
  });
});