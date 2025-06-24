export interface PlanningTable {
  id: number;
  tableName: string;
  user?: {
    id: string;
    name?: string; 
  };
  organization?: string;
  createdAt?: string;
  modifiedAt?: string;
}
