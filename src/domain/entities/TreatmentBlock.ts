export interface TreatmentBlockProps {
  id: string; // BIGINT as string
  createdAt?: Date;
  treatmentId: string;
  beginningDate: Date;
  durationDays: number;
  iterations: number;
}

export class TreatmentBlock {
  constructor(private _props: TreatmentBlockProps) {}
  
  get props(): TreatmentBlockProps { 
    return { ...this._props }; 
  }
  
  get id(): string { return this._props.id; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get treatmentId(): string { return this._props.treatmentId; }
  get beginningDate(): Date { return this._props.beginningDate; }
  get durationDays(): number { return this._props.durationDays; }
  get iterations(): number { return this._props.iterations; }
} 