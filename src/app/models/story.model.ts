import { PlanningTable } from "./planning-table.model";

// models/story.model.ts
export interface Story {
  storyId: string;
  title: string;
  description: string;
  storyPoint?: number;
  createdAt?: string;
  modifiedAt?: string;
  planTable: Partial<PlanningTable>; 
}
