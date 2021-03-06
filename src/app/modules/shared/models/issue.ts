import { State } from './state';
import { Vehicle } from './vehicle';
import { Malfunction } from './malfunction';
import { User } from './user';
import { TEntity } from '../../core/models/entity/entity';
import { Employee } from './employee';

export class Issue extends TEntity<Issue> {
  state: State;
  malfunction: Malfunction;
  warranty: number;
  vehicle: Vehicle;
  assignedTo: Employee;
  deadline: Date;
  summary: string;
  createDate: Date;
  modDate: Date;
  priority: number;
  number: number;

  constructor(issue: Partial<Issue>) {
    super(issue);
    this.state = new State(this.state);
    this.malfunction = new Malfunction(this.malfunction);
    this.vehicle = new Vehicle(this.vehicle);
    this.assignedTo = new Employee(this.assignedTo);
  }
}
