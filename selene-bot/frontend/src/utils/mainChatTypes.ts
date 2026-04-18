export interface Message {
  messageId: string;
  isUser: boolean;
  content: string;
  ts: number;
  isLikeEnabled: boolean;
  isDislikeEnabled: boolean;
  thinkingTime?: number | null;
}