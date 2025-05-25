export interface PatientUserProps {
  id: string; // BIGINT as string
  createdAt?: Date;
  userId: string; // UUID as string
  patientId: string;
}

export class PatientUser {
  constructor(private _props: PatientUserProps) {}
  
  get props(): PatientUserProps { 
    return { ...this._props }; 
  }
  
  get id(): string { return this._props.id; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get userId(): string { return this._props.userId; }
  get patientId(): string { return this._props.patientId; }
} 