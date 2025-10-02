export interface Message {
  sender: number;
  data: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  last_message: string;
  is_online?: boolean;
  lastOnlineTime?: number;
}

export interface SendMessageRequest {
  id: number; // recipient id
  msg: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: number | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
} 