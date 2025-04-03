import { Component, OnInit } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ComponentSwitcherService } from '../../shared/services/component-switcher.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-access',
  imports: [NgComponentOutlet],
  templateUrl: './access.component.html',
  styleUrl: './access.component.scss'
})
export class AccessComponent implements OnInit {

  constructor(private route: ActivatedRoute, public componentSwitcher: ComponentSwitcherService) {}

  ngOnInit(): void {
    const mode = this.route.snapshot.queryParamMap.get('mode');
    if (mode === 'reset') {
      this.changeComponent('conPassword');
    }
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
