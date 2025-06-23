// models/vote.model.ts
export interface Vote {
  voteId?: number;
  userId: string;
  questionId: number;
  storyId: number;
  voteValue: number;
}
