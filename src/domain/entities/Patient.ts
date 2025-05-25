export interface PatientProps {
  id: string; // BIGINT as string
  createdAt?: Date;
  fullName: string;
  dateOfBirth?: Date;
  description?: string;
}

export class Patient {
  constructor(private _props: PatientProps) {}
  
  get props(): PatientProps { 
    return { ...this._props }; 
  }
  
  get id(): string { return this._props.id; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get fullName(): string { return this._props.fullName; }
  get dateOfBirth(): Date | undefined { return this._props.dateOfBirth; }
  get description(): string | undefined { return this._props.description; }
}
