export interface NoteProps {
  id: string; // BIGINT as string
  userPatientId: string;
  createdAt?: Date;
  title?: string;
  description?: string;
}

export class Note {
  constructor(private _props: NoteProps) {}
  
  get props(): NoteProps { 
    return { ...this._props }; 
  }
  
  get id(): string { return this._props.id; }
  get userPatientId(): string { return this._props.userPatientId; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get title(): string | undefined { return this._props.title; }
  get description(): string | undefined { return this._props.description; }
}
