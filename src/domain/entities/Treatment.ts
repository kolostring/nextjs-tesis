export interface TreatmentProps {
  id: string; // BIGINT as string
  createdAt?: Date;
  patientId: string;
  eyeCondition: string;
  name: string;
  description?: string;
}

export class Treatment {
  constructor(private _props: TreatmentProps) {}
  
  get props(): TreatmentProps { 
    return { ...this._props }; 
  }
  
  get id(): string { return this._props.id; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get patientId(): string { return this._props.patientId; }
  get eyeCondition(): string { return this._props.eyeCondition; }
  get name(): string { return this._props.name; }
  get description(): string | undefined { return this._props.description; }
}
