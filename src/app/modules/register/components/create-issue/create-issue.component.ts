import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TEntity } from 'src/app/modules/core/models/entity/entity';
import { malfunctionSelectedValidator } from 'src/app/custom-errors';
import { Vehicle } from 'src/app/modules/shared/models/vehicle';
import { MalfunctionGroup } from 'src/app/modules/shared/models/malfunction-group';
import { MalfunctionSubgroup } from 'src/app/modules/shared/models/malfunction-subgroup';
import { Malfunction } from 'src/app/modules/shared/models/malfunction';
import { Issue } from 'src/app/modules/shared/models/issue';
import { MalfunctionService } from 'src/app/modules/shared/services/malfunction.service';
import { IssueService } from 'src/app/modules/shared/services/issue.service';
import { VehicleService } from 'src/app/modules/shared/services/vehicle.service';

@Component({
  selector: 'app-create-issue',
  templateUrl: './create-issue.component.html',
  styleUrls: ['./create-issue.component.scss']
})
export class CreateIssueComponent implements OnInit {
  @Output() addIssue = new EventEmitter<Issue>();

  issueForm: FormGroup;
  vehicles: Vehicle[] = [];
  malfunctionGroups: MalfunctionGroup[] = [];
  malfunctionSubgroups: MalfunctionSubgroup[] = [];
  malfunctions: Malfunction[] = [];
  malfunctionSubgroupsFilteredByGroup: MalfunctionSubgroup[] = [];
  malfunctionsFilteredByGroup: Malfunction[] = [];

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private malfunctionService: MalfunctionService,
    private issueService: IssueService,
    private toast: ToastrService
  ) {}

  ngOnInit() {
    this.setUpForm();
    this.loadEntities();
    this.configureMalfunctionControls();
  }

  onSubmit() {
    if (this.issueForm.invalid) {
      return;
    }
    this.createIssue();
    this.setUpForm();
    this.hideModalWindow();
  }

  clickSubmit(button: HTMLButtonElement) {
    button.click();
  }

  closeModal() {
    this.issueForm.reset();
  }

  configureMalfunctionControls() {
    const { malfunctionGroup, malfunctionSubgroup, malfunction } = this.issueForm.controls;

    this.setDependentControl(malfunctionGroup, malfunctionSubgroup);
    this.setDependentControl(malfunctionSubgroup, malfunction);
  }

  reload() {
    this.malfunctionSubgroupsFilteredByGroup = this.getMalfunctionSubgroupsFilteredByGroup();
    this.malfunctionsFilteredByGroup = this.getMalfunctionsFilteredByGroup();
  }

  private setUpForm() {
    this.issueForm = this.fb.group(
      {
        vehicle: [null, Validators.required],
        malfunctionGroup: null,
        malfunctionSubgroup: [{ value: null, disabled: true }],
        malfunction: [{ value: null, disabled: true }],
        summary: ['', Validators.required]
      },
      { validators: malfunctionSelectedValidator }
    );
  }

  private getMalfunctionSubgroupsFilteredByGroup(): MalfunctionSubgroup[] {
    const selectedGroup = this.formValue.malfunctionGroup;
    const filteredSubgroups = this.filterSubgroupsByGroup(selectedGroup);
    return filteredSubgroups;
  }

  private getMalfunctionsFilteredByGroup(): Malfunction[] {
    const selectedSubgroup = this.formValue.malfunctionSubgroup;
    const filteredMalfunctions = this.filterMalfunctionsBySubgroup(selectedSubgroup);
    return filteredMalfunctions;
  }

  private loadEntities() {
    this.vehicleService.getEntities().subscribe(data => (this.vehicles = data));
    this.malfunctionService.getEntities().subscribe(malfunctions => {
      this.malfunctions = malfunctions;

      const allSubgroups = malfunctions.map(m => m.malfunctionSubgroup);
      this.malfunctionSubgroups = Array.from(this.getDistinct(allSubgroups));

      const allGroups = this.malfunctionSubgroups.map(s => s.malfunctionGroup);
      this.malfunctionGroups = Array.from(this.getDistinct(allGroups));
    });
  }

  private getDistinct<T extends TEntity<T>>(entities: T[]) {
    return entities.filter((value, index, self) => self.findIndex(item => item.id === value.id) === index);
  }

  private createIssue() {
    const issue = new Issue(this.formValue);
    this.issueService
      .addEntity(issue)
      .subscribe(
        newIssue => this.addIssue.next(newIssue),
        _ => this.toast.error('Не вдалось створити заявку', 'Помилка створення заявки')
      );
  }

  private get formValue() {
    return this.issueForm.value;
  }

  private hideModalWindow() {
    const modalWindow: any = $('#createIssue');
    modalWindow.modal('hide');
  }

  private filterSubgroupsByGroup(group: MalfunctionGroup): MalfunctionSubgroup[] {
    if (!group) {
      this.setDefaultSubgroup();
      return [];
    }
    const filteredSubgroups = this.malfunctionSubgroups.filter(
      subgroup => subgroup.malfunctionGroup.name === group.name
    );

    if (this.notSelectedSubgroup(filteredSubgroups)) {
      this.setDefaultSubgroup();
    }
    return filteredSubgroups;
  }

  private notSelectedSubgroup(subgroups: MalfunctionSubgroup[]): boolean {
    return subgroups.findIndex(s => s === this.formValue.malfunctionSubgroup) === -1;
  }

  private setDefaultSubgroup(): void {
    this.issueForm.patchValue({ malfunctionSubgroup: null });
  }

  private filterMalfunctionsBySubgroup(subgroup: MalfunctionSubgroup): Malfunction[] {
    if (!subgroup) {
      this.setDefaultMalfunction();
      return [];
    }

    const filteredMalfunctions = this.malfunctions.filter(
      malfunction => malfunction.malfunctionSubgroup.name === subgroup.name
    );

    if (this.notSelectedMalfunction(filteredMalfunctions)) {
      this.setDefaultMalfunction();
    }
    return filteredMalfunctions;
  }

  private notSelectedMalfunction(malfunctions: Malfunction[]): boolean {
    return malfunctions.findIndex(m => m === this.formValue.malfunction) === -1;
  }

  private setDefaultMalfunction(): void {
    this.issueForm.patchValue({ malfunction: null });
  }

  private setDependentControl(main: AbstractControl, dependent: AbstractControl) {
    main.valueChanges.subscribe(selectedValue => {
      if (selectedValue !== null) {
        dependent.enable();
      } else {
        dependent.disable();
        dependent.setValue(null);
      }
    });
  }
}
