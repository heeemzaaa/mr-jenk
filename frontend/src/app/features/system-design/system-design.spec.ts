import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemDesign } from './system-design';

describe('SystemDesign', () => {
  let component: SystemDesign;
  let fixture: ComponentFixture<SystemDesign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemDesign]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemDesign);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
