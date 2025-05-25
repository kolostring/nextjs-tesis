export interface TherapeuticActivityProps {
  id: string; // BIGINT as string
  createdAt?: Date;
  treatmentBlockId: string;
  name: string;
  description?: string;
  dayOfBlock: number;
  beginningHour: string; // TIME as string (HH:mm format)
  endHour: string; // TIME as string (HH:mm format)
}

export class TherapeuticActivity {
  constructor(private _props: TherapeuticActivityProps) {}
  
  get props(): TherapeuticActivityProps { 
    return { ...this._props }; 
  }
  
  get id(): string { return this._props.id; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get treatmentBlockId(): string { return this._props.treatmentBlockId; }
  get name(): string { return this._props.name; }
  get description(): string | undefined { return this._props.description; }
  get dayOfBlock(): number { return this._props.dayOfBlock; }
  get beginningHour(): string { return this._props.beginningHour; }
  get endHour(): string { return this._props.endHour; }
}
