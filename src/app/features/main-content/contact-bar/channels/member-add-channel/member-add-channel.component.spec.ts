import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberAddChannelComponent } from './member-add-channel.component';

describe('MemberAddChannelComponent', () => {
  let component: MemberAddChannelComponent;
  let fixture: ComponentFixture<MemberAddChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberAddChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberAddChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
