import { Component, OnInit } from '@angular/core';
import { InstanceSummary, INSTANCE_SUMMARY_DEFAULT } from './instance-summary';
import { InstanceSummaryService } from './instance-summary.service';
import { SdrangelUrlService } from '../sdrangel-url.service';

@Component({
  selector: 'app-instance-summary',
  templateUrl: './instance-summary.component.html',
  styleUrls: ['./instance-summary.component.css']
})
export class InstanceSummaryComponent implements OnInit {
  sdrangelURL: string;
  instanceSummary: InstanceSummary = INSTANCE_SUMMARY_DEFAULT;
  statusMessage: string;
  statusError = false;

  constructor(private instanceSummaryService: InstanceSummaryService,
              private sdrangelUrlService: SdrangelUrlService) { }

  ngOnInit(): void {
    this.sdrangelUrlService.currentUrlSource.subscribe(url => {
      this.sdrangelURL = url;
      this.fetchInstanceSummary();
    });
  }

  fetchInstanceSummary() {
    this.instanceSummaryService.getInfo(this.sdrangelURL).subscribe(
      instanceSummary => {
        this.instanceSummary = instanceSummary;
        this.statusMessage = 'OK';
        this.statusError = false;
      },
      error => {
        this.statusMessage = error.message;
        this.statusError = true;
      }
    );
  }
}
