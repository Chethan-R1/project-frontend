import { Story } from "./story.model";

// models/question.model.ts
export interface Question {
  questionId?: number;
  story: Story;
  questionText: string;
  isActive: boolean;
}
