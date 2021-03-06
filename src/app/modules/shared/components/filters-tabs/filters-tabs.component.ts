import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { VehicleType } from '../../models/vehicleType';
import { State } from '../../models/state';
import { MalfunctionGroup } from '../../models/malfunction-group';
import { MalfunctionSubgroup } from '../../models/malfunction-subgroup';
import { Malfunction } from '../../models/malfunction';
import { Priority } from 'src/app/modules/core/models/priority/priority';
import { StateService } from '../../services/state.service';
import { MalfunctionService } from '../../services/malfunction.service';
import { MalfunctionGroupService } from '../../services/malfunction-group.service';
import { MalfunctionSubgroupService } from '../../services/malfunction-subgroup.service';
import { VehicleTypeService } from '../../services/vehicle-type.service';

@Component({
  selector: 'app-filters-tabs',
  templateUrl: './filters-tabs.component.html',
  styleUrls: ['./filters-tabs.component.scss']
})
export class FiltersTabsComponent implements OnInit {
  vehicleTypeList: VehicleType[] = [];
  stateList: State[] = [];
  malfunctionGroupList: MalfunctionGroup[] = [];
  malfunctionSubGroupList: MalfunctionSubgroup[] = [];
  malfunctionList: Malfunction[] = [];
  priorityList = Priority;
  keys = [];
  malfunctionSubGroupFilteredList: MalfunctionSubgroup[] = [];
  malfunctionFilteredList: Malfunction[] = [];
  currentMalfunctionSubgroup: MalfunctionSubgroup;
  currentMalfunction: Malfunction;

  @Output() StartDateValue = new EventEmitter<string>();
  @Output() EndDateValue = new EventEmitter<string>();
  @Output() VechicleTypeValue = new EventEmitter<string>();
  @Output() StateValue = new EventEmitter<string>();
  @Output() Filter = new EventEmitter();
  @Output() PriorityValue = new EventEmitter<string>();
  @Output() MalfunctionGroupValue = new EventEmitter<string>();
  @Output() MalfunctionSubGroupValue = new EventEmitter<string>();
  @Output() MalfunctionValue = new EventEmitter<string>();

  selectedType: string;
  selectedState: string;
  selectedPriority: string;
  selectedMalfunctionGroup: string;
  selectedMalfunctionSubGroup: string;
  selectedMalfunction: string;

  constructor(
    private vehicleTypeService: VehicleTypeService,
    private stateService: StateService,
    private malfunctionGropService: MalfunctionGroupService,
    private malfunctionSubGropService: MalfunctionSubgroupService,
    private malfunctionService: MalfunctionService
  ) {
    this.keys = Object.keys(this.priorityList).filter(f => !isNaN(Number(f)));
  }

  ngOnInit() {
    this.vehicleTypeService.getEntities().subscribe(data => (this.vehicleTypeList = data));
    this.stateService.getEntities().subscribe(data => (this.stateList = data));
    this.malfunctionGropService.getEntities().subscribe(items => (this.malfunctionGroupList = items));
    this.malfunctionSubGropService.getEntities().subscribe(data => {
      this.malfunctionSubGroupList = data;
      this.malfunctionSubGroupFilteredList = data;
    });
    this.malfunctionService.getEntities().subscribe(data => {
      this.malfunctionList = data;
      this.malfunctionFilteredList = data;
    });
    ($('#startDate') as any).datepicker({
      uiLibrary: 'bootstrap4',
      iconsLibrary: 'fontawesome',
      maxDate() {
        return $('#endDate').val();
      }
    });
    ($('#endDate') as any).datepicker({
      uiLibrary: 'bootstrap4',
      iconsLibrary: 'fontawesome',
      minDate() {
        return $('#startDate').val();
      },
      maxDate: new Date()
    });
  }

  selectGroup(): void {
    this.selectedMalfunctionSubGroup = null;
    this.selectedMalfunction = null;
    if (this.selectedMalfunctionGroup) {
      this.malfunctionSubGroupFilteredList = this.getByGroup(this.selectedMalfunctionGroup);
    }
  }
  private getByGroup(group: string): Array<MalfunctionSubgroup> {
    return this.malfunctionSubGroupList.filter(subgroup => subgroup.malfunctionGroup.name === group);
  }

  selectMalfunctionGroupType(group) {
    this.selectedMalfunctionSubGroup = null;
    this.currentMalfunctionSubgroup = null;
    this.malfunctionSubGroupFilteredList = this.malfunctionSubGroupList;
    if (group) {
      this.selectedMalfunctionGroup = group.name;
      this.selectGroup();
    }
  }
  selectSubgroup(): void {
    this.selectedMalfunction = null;
    if (this.selectedMalfunctionSubGroup) {
      this.malfunctionFilteredList = this.getBySubgroup(this.selectedMalfunctionSubGroup);
    }
  }
  private getBySubgroup(subgroup: string): Array<Malfunction> {
    return this.malfunctionList.filter(malfunc => malfunc.malfunctionSubgroup.name === subgroup);
  }

  selectMalfunctionSubGroupType(subgroup) {
    this.selectedMalfunction = null;
    this.currentMalfunction = null;
    this.malfunctionFilteredList = this.malfunctionList;
    if (subgroup) {
      this.selectedMalfunctionSubGroup = subgroup.name;
      this.selectSubgroup();
    }
  }
  selectMalfunctionType(malfunction) {
    if (malfunction) {
      this.selectedMalfunction = malfunction.name;
    }
  }

  selectVechicleType(type) {
    this.selectedType = type;
  }
  selectState(state) {
    this.selectedState = state;
  }
  selectPriority(value) {
    this.selectedPriority = value;
  }
  selectFilter() {
    this.EndDateValue.next(
      $('#endDate')
        .val()
        .toString()
    );
    this.StartDateValue.next(
      $('#startDate')
        .val()
        .toString()
    );
    this.VechicleTypeValue.next(this.selectedType);
    this.StateValue.next(this.selectedState);
    this.PriorityValue.next(this.selectedPriority);
    this.MalfunctionGroupValue.next(this.selectedMalfunctionGroup);
    this.MalfunctionSubGroupValue.next(this.selectedMalfunctionSubGroup);
    this.MalfunctionValue.next(this.selectedMalfunction);
    this.Filter.next();
  }
}
