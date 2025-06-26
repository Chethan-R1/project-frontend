export interface WebSocketMessage {
  type: string;
  userId?: string;
  action?: string;
  roomId?:string;
  userName?: string;
  storyId?: string;
  storyIndex?: number; 
  hasVoted?: boolean;
  sessionId?: string;
  timestamp: number;
  vote?: string;
  story?: any;
  timer?: number;
}