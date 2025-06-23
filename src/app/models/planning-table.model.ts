export interface PlanningTable {
  id: number;
  tableName: string;
  user?: {
    id: number;
    name?: string; 
  };
  organization?: string;
  createdAt?: string;
  modifiedAt?: string;
}
