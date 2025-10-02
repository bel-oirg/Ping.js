import { OnlineUserData } from './socket';

class OnlineUsersStore {
  private onlineUsers: OnlineUserData[] = [];
  private listeners: Set<() => void> = new Set();

  getUsers(): OnlineUserData[] {
    return [...this.onlineUsers]; 
  }

  getUserCount(): number {
    return this.onlineUsers.length;
  }

  isUserOnline(userId: number): boolean {
    return this.onlineUsers.some(user => Number(user.userId) === Number(userId));
  }
  
  getUserById(userId: number): OnlineUserData | undefined {
    return this.onlineUsers.find(user => Number(user.userId) === Number(userId));
  }
  setUsers(users: OnlineUserData[]): void {
    const hasChanges = this.hasUserListChanged(this.onlineUsers, users);
    this.onlineUsers = [...users];
    
    if (hasChanges) {
      this.notifyListeners();
    }
  }

  addUser(user: OnlineUserData): void {
    const existingIndex = this.onlineUsers.findIndex(u => Number(u.userId) === Number(user.userId));
    let hasChanged = false;
    
    if (existingIndex >= 0) {
      const existingUser = this.onlineUsers[existingIndex];
      if (JSON.stringify(existingUser) !== JSON.stringify(user)) {
        this.onlineUsers[existingIndex] = { ...user };
        hasChanged = true;
      }
    } else {
      this.onlineUsers.push({ ...user });
      hasChanged = true;
    }
    
    if (hasChanged) {
      this.notifyListeners();
    }
  }

  removeUser(userId: number): void {
    const initialLength = this.onlineUsers.length;
    this.onlineUsers = this.onlineUsers.filter(user => Number(user.userId) !== Number(userId));
    
    if (initialLength !== this.onlineUsers.length) {
      this.notifyListeners();
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private hasUserListChanged(oldList: OnlineUserData[], newList: OnlineUserData[]): boolean {
    if (oldList.length !== newList.length) return true;    
    const oldMap = new Map(oldList.map(user => [Number(user.userId), user]));
    for (const newUser of newList) {
      const oldUser = oldMap.get(Number(newUser.userId));
      if (!oldUser || JSON.stringify(oldUser) !== JSON.stringify(newUser)) {
        return true;
      }
    }
    
    return false;
  }
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const onlineUsersStore = new OnlineUsersStore(); 