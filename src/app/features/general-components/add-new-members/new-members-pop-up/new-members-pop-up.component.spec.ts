import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMembersPopUpComponent } from './new-members-pop-up.component';

describe('NewMembersPopUpComponent', () => {
  let component: NewMembersPopUpComponent;
  let fixture: ComponentFixture<NewMembersPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewMembersPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewMembersPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
