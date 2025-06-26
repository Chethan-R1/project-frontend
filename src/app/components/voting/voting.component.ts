import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { WebSocketService } from '../../services/websocket.service';
import { WebSocketMessage } from '../../models/WebSocketMessage.model';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { PlanningTableService } from '../../services/planning-table.service';
import { StoryService } from '../../services/story.service';


// WebSocket Service (from previous implementation)


// Your existing interfaces
interface Story {
  id?: string;
  storyName: string;
  isActive?: boolean;
}

// interface User {
//   id: string;
//   name: string;
//   moderator:boolean;

//   username: string;
// }

interface Vote {
  id?: string;
  user: User;
  voteValue: string;
  storyId: string;
  timestamp?: Date;
}

interface UserVoteStatus {
  userId: string;
  userName: string;
  hasVoted: boolean;
  voteValue?: string;
  isRevealed: boolean;
}

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.css']
})
export class VotingComponent implements OnInit, OnDestroy   {
tableName: string = '';
  story: string = '';
  stories: Story[] = [];
  planTableId: string = '';
  currentStoryIndex: number | null = null;
  votes: (string)[] = ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'];
  selectedVote: Vote[] = [];
  usersInRoom: User[] = [];
  currentUserId: string = '';
  isModerator: boolean = false;
  
  // Timer properties
  votingStarted: boolean = false;
  timerSeconds: number = 0;
  private timerSubscription?: Subscription;
  
  // Edit story properties
  editingIndex: number | null = null;
  storyEditText: string = '';

  // WebSocket properties
  
  private subscriptions: Subscription[] = [];
  isConnected: boolean = false;
  userVoteStatuses: Map<string, UserVoteStatus> = new Map();
  votesRevealed: boolean = false;
  currentUserVote: string | null = null;
  Math: any;


  constructor(
    private route: ActivatedRoute,
    private webSocketService: WebSocketService,
    private router:Router,
    private userService:UserService,
    private http: HttpClient,
    private planningTableService: PlanningTableService,
    private storyService: StoryService
  ) {
    // Initialize user info
    this.currentUserId = localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
    this.isModerator = localStorage.getItem('isModerator') === 'true';
    
    // Get current user info
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!this.usersInRoom.find(u => u.id === this.currentUserId)) {
      this.usersInRoom.push({
        id: this.currentUserId,
        name: currentUser.name || 'User',
        username: currentUser.username || 'user',
        moderator: false,
     
      });
    }
  }

  ngOnInit(): void {
    // this.tableName = this.route.snapshot.paramMap.get('roomId') || 'default-room';
    this.planTableId = this.route.snapshot.paramMap.get('roomId') || '';
    this.loadTableName();
    this.connectToWebSocket();

    this.loadStories();
    this.addMemberToRoom();

    this.connectToWebSocket();
    this.subscribeToWebSocketMessages();
    this.loadUsersInRoom();
    this.setupUnloadHandler();
  }

  setupUnloadHandler(): void {
  window.addEventListener('beforeunload', () => {
    this.notifyUserLeft();  // Send before disconnect
    this.webSocketService?.disconnect();
  });
}

ngOnDestroy(): void {
  this.notifyUserLeft();  // Also call here if destroyed by Angular
  this.webSocketService?.disconnect();

  this.subscriptions.forEach(sub => sub.unsubscribe());
  if (this.timerSubscription) {
    this.timerSubscription.unsubscribe();
  }
}

private notifyUserLeft(): void {
  this.webSocketService.sendMessage({
    action: 'USER_LEFT',
    roomId: this.tableName,
    userId: this.currentUserId,
    type: 'USER_LEFT',
    timestamp: Date.now()
  });
}

  loadTableName() {
  this.planningTableService.getById(this.planTableId).subscribe({
    next: (table: { tableName: string; }) => {
      this.tableName = table.tableName;
    },
    error: (err: any) => {
      console.error('Failed to fetch table name:', err);
      this.tableName = this.planTableId;
    }
  });
}


  // ngOnDestroy(): void {
  //   this.subscriptions.forEach(sub => sub.unsubscribe());
  //   if (this.timerSubscription) {
  //     this.timerSubscription.unsubscribe();
  //   }
  //   this.webSocketService?.disconnect();
  // }

  // WebSocket Integration Methods
 private connectToWebSocket(): void {
  try {
    this.webSocketService.connect(this.tableName);
    this.isConnected = true;
    console.log('Connected to voting room:', this.tableName);

    // Announce user joined
    this.broadcastUserJoined();
  } catch (error) {
    console.error('Failed to connect to WebSocket:', error);
    this.isConnected = false;
  }
}
private broadcastUserJoined(): void {
  this.webSocketService.sendMessage({
    action: 'USER_JOINED',
    roomId: this.tableName,
    userId: this.currentUserId,
    userName: this.usersInRoom.find(u => u.id === this.currentUserId)?.name || 'User',
    type: 'USER_JOINED',
    timer: 0,
    timestamp: Date.now()
  });
}


  //   throw new Error('Method not implemented.');
  // }

// loadUsersInRoom() {
//   this.userService.getUserByRoomId(this.planTableId).subscribe({
//     next: (users: User[]) =>{
//       this.usersInRoom = users;
//        const currentUser = users.find(user => user.userId === this.currentUserId);

//       this.isModerator = currentUser?.moderator === true;
//       console.log(users,"Users in room")
//     },
//     error: (err: any) => console.error('Failed to load users:', err)
//   });
// }

  


  private subscribeToWebSocketMessages(): void {
    const messagesSub = this.webSocketService?.getMessages().subscribe(
      (message: WebSocketMessage | null) => {
        if (message) {
          this.handleWebSocketMessage(message);
        }
      }
    );
    if (messagesSub) {
      this.subscriptions.push(messagesSub);
    }

    const statusSub = this.webSocketService?.getConnectionStatus().subscribe(
      (connected: boolean) => {
        this.isConnected = connected;
      }
    );
    if (statusSub) {
      this.subscriptions.push(statusSub);
    }
  }

  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'USER_JOINED':
        this.handleUserJoined(message);
        break;
      case 'USER_LEFT':
        this.handleUserLeft(message);
        break;
      case 'VOTE_CAST':
        this.handleVoteCast(message);
        break;
      case 'VOTES_REVEALED':
        this.handleVotesRevealed();
        break;
      case 'VOTES_RESET':
        this.handleVotesReset();
        break;
      case 'VOTING_STARTED':
        this.handleVotingStarted(message);
        break;
      case 'VOTING_STOPPED':
        this.handleVotingStopped();
        break;
      case 'STORY_CHANGED':
        this.handleStoryChanged(message);
        break;
      case 'TIMER_UPDATE':
        this.handleTimerUpdate(message);
        break;
    }
  }

  // private broadcastUserJoined(): void {
  //   this.webSocketService?.sendMessage({
  //     action: 'USER_JOINED',
  //     roomId: this.tableName,
  //     userId: this.currentUserId,
  //     userName: this.usersInRoom.find(u => u.id === this.currentUserId)?.name || 'User',
  //     type: '',
  //     timestamp: 0
  //   });
  // }

  addMemberToRoom() {
  const userId = localStorage.getItem('userId');
  const tableId = this.planTableId;
  if (userId && tableId) {
    this.http.post('http://localhost:8080/api/members', {
      userId,
      tableId
    }).subscribe({
      next: () => {
        console.log('User added to table');
        this.loadUsersInRoom();
      },
      error: (err) => console.error('Error adding user to table:', err)
    });
  }
}

loadUsersInRoom(): void {
  this.userService.getUserByRoomId(this.planTableId).subscribe({
    next: (users: User[]) => {
      this.usersInRoom = users;
      const currentUser = users.find(u => u.id === this.currentUserId);
      this.isModerator = currentUser?.moderator === true;
    },
    error: (err: any) => console.error('Failed to load users:', err)
  });
}


  // Enhanced existing methods with WebSocket integration
addStory(): void {
  const userId = localStorage.getItem('userId');
  if (this.story.trim() && userId) {
    const newStory = {
      title: this.story,
      description: '',
      planTable: { id: this.planTableId },
      createdBy: { userId }
    };

    this.storyService.create(newStory).subscribe({
      next: (createdStory: any) => {
        this.loadStories(); // reload all stories
        this.story = '';
      },
      error: (err: { error: any; }) => {
        console.error('Failed to create story:', err);
        alert(err.error || 'Could not add story.');
      }
    });
  }
}

loadStories(): void {
  this.storyService.getByRoomId(this.planTableId).subscribe((data: any[]) => {
    this.stories = data.map(story => ({
      id: story.storyId,
      storyName: story.title
    }));
  });
}


  setStory(index: number): void {
    if (!this.isModerator) return;
    
    this.currentStoryIndex = index;
    this.votesRevealed = false;
    this.clearVotes();

    // Broadcast story change
    if (this.isConnected) {
      this.webSocketService?.sendMessage({
        action: 'STORY_CHANGED',
        roomId: this.tableName,
        userId: this.currentUserId,
        storyIndex: index,
        story: this.stories[index],
        type: '',
        timestamp: 0
      });
    }
  }

  startVoting(): void {
    if (!this.isModerator || this.currentStoryIndex === null) return;
    
    this.votingStarted = true;
    this.timerSeconds = 0;
    this.votesRevealed = false;
    this.clearVotes();
    
    // Start timer
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timerSeconds++;
      // Broadcast timer update every 5 seconds
      if (this.timerSeconds % 5 === 0 && this.isConnected) {
        this.webSocketService?.sendMessage({
          action: 'TIMER_UPDATE',
          roomId: this.tableName,
          timer: this.timerSeconds,
          type: '',
          timestamp: 0
        });
      }
    });

    // Broadcast voting started
    if (this.isConnected) {
      this.webSocketService?.sendMessage({
        action: 'VOTING_STARTED',
        roomId: this.tableName,
        storyId: this.stories[this.currentStoryIndex].id,
        timer: this.timerSeconds,
        type: '',
        timestamp: 0
      });
    }
  }

  stopVoting(): void {
    if (!this.isModerator) return;
    
    this.votingStarted = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    // Broadcast voting stopped
    if (this.isConnected) {
      this.webSocketService?.sendMessage({
        action: 'VOTING_STOPPED',
        roomId: this.tableName,
        type: '',
        timestamp: 0
      });
    }
  }

  vote(voteValue: string): void {
    if (!this.votingStarted || this.currentStoryIndex === null) return;

    this.currentUserVote = voteValue;
    
    // Save vote locally (you might want to call your HTTP service here)
    const voteData: Vote = {
      user: this.usersInRoom.find(u => u.id === this.currentUserId)!,
      voteValue: voteValue,
      storyId: this.stories[this.currentStoryIndex].id!,
      timestamp: new Date()
    };

    // Update local vote
    const existingVoteIndex = this.selectedVote.findIndex(v => v.user.id === this.currentUserId);
    if (existingVoteIndex >= 0) {
      this.selectedVote[existingVoteIndex] = voteData;
    } else {
      this.selectedVote.push(voteData);
    }

    // Broadcast vote cast (without revealing the actual vote)
    if (this.isConnected) {
      this.webSocketService?.sendMessage({
        action: 'VOTE_CAST',
        roomId: this.tableName,
        userId: this.currentUserId,
        storyId: this.stories[this.currentStoryIndex].id,
        hasVoted: true,
        type: '',
        timestamp: 0
      });
    }
  }

  revealVotes(): void {
    if (!this.isModerator) return;
    
    this.votesRevealed = true;
    
    // Broadcast votes reveal
    if (this.isConnected) {
      this.webSocketService?.sendMessage({
        action: 'VOTES_REVEALED',
        roomId: this.tableName,
        vote: JSON.stringify(this.selectedVote),
        type: '',
        timestamp: 0
      });
    }
  }

  clearVotes(): void {
    if (!this.isModerator) return;
    
    this.selectedVote = [];
    this.currentUserVote = null;
    this.userVoteStatuses.clear();
    this.votesRevealed = false;

    // Broadcast votes reset
    if (this.isConnected) {
      this.webSocketService?.sendMessage({
        action: 'VOTES_RESET',
        roomId: this.tableName,
        type: '',
        timestamp: 0
      });
    }
  }

  // WebSocket event handlers
  private handleUserJoined(message: WebSocketMessage): void {
    if (message.userId && message.userId !== this.currentUserId) {
      const existingUser = this.usersInRoom.find(u => u.id === message.userId);
      if (!existingUser) {
        this.usersInRoom.push({
          id: message.userId,
          name: (message as any).userName || 'User',
          username: (message as any).userName || 'user',
          moderator: false,
        
        });
      }
    }
  }

  private handleUserLeft(message: WebSocketMessage): void {
    if (message.userId) {
      this.usersInRoom = this.usersInRoom.filter(u => u.id !== message.userId);
      this.userVoteStatuses.delete(message.userId);
    }
  }

  private handleVoteCast(message: WebSocketMessage): void {
    if (message.userId) {
      const userStatus: UserVoteStatus = {
        userId: message.userId,
        userName: this.usersInRoom.find(u => u.id === message.userId)?.name || 'User',
        hasVoted: message.hasVoted || false,
        isRevealed: this.votesRevealed
      };
      
      if (this.votesRevealed && message.vote) {
        userStatus.voteValue = message.vote;
      }
      
      this.userVoteStatuses.set(message.userId, userStatus);
    }
  }

  private handleVotesRevealed(): void {
    this.votesRevealed = true;
    // Update all vote statuses to show revealed votes
    this.userVoteStatuses.forEach(status => {
      status.isRevealed = true;
    });
  }

  private handleVotesReset(): void {
    this.selectedVote = [];
    this.currentUserVote = null;
    this.userVoteStatuses.clear();
    this.votesRevealed = false;
  }

  private handleVotingStarted(message: WebSocketMessage): void {
    // if (message.userId !== this.currentUserId) { // Don't update if we started it
      this.votingStarted = true;
      this.timerSeconds = message.timer || 0;
      this.votesRevealed = false;
      this.clearVotes();
    }
  // }

  private handleVotingStopped(): void {
    if (!this.isModerator) { // Only update for non-moderators
      this.votingStarted = false;
    }
  }

private handleStoryChanged(message: WebSocketMessage): void {
  if (message.storyIndex !== undefined) {
    this.currentStoryIndex = message.storyIndex;
    this.votesRevealed = false;
    this.clearVotes();
  }
}


  private handleTimerUpdate(message: WebSocketMessage): void {
    if (message.timer !== undefined && !this.isModerator) {
      this.timerSeconds = message.timer;
    }
  }

  // Enhanced existing utility methods
  getTimerFormatted(): string {
    const minutes = Math.floor(this.timerSeconds / 60);
    const seconds = this.timerSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getUserVoteStatus(userId: string): UserVoteStatus | undefined {
    return this.userVoteStatuses.get(userId);
  }

  hasUserVoted(userId: string): boolean {
    const status = this.userVoteStatuses.get(userId);
    return status ? status.hasVoted : false;
  }

  getUserVoteValue(userId: string): string | undefined {
    const status = this.userVoteStatuses.get(userId);
    return status && status.isRevealed ? status.voteValue : undefined;
  }

  // Existing methods (keep as they are)
  editStory(index: number): void {
    this.editingIndex = index;
    this.storyEditText = this.stories[index].storyName;
  }

  // saveEditedStory(): void {
  //   if (this.editingIndex !== null && this.storyEditText.trim()) {
  //     this.stories[this.editingIndex].storyName = this.storyEditText.trim();
  //     this.editingIndex = null;
  //     this.storyEditText = '';
  //   }
  // }

  saveEditedStory(): void {
  if (this.editingIndex !== null && this.storyEditText.trim()) {
    const storyId = this.stories[this.editingIndex].id!;
    const updatedStory = {
      title: this.storyEditText.trim(),
      description: ''
    };
    this.storyService.update(storyId, updatedStory).subscribe(() => {
      this.stories[this.editingIndex!].storyName = this.storyEditText.trim();
      this.cancelEdit();
    });
  }
}


  cancelEdit(): void {
    this.editingIndex = null;
    this.storyEditText = '';
  }

  // deleteStory(index: number): void {
  //   this.stories.splice(index, 1);
  //   if (this.currentStoryIndex === index) {
  //     this.currentStoryIndex = null;
  //     this.votingStarted = false;
  //     if (this.timerSubscription) {
  //       this.timerSubscription.unsubscribe();
  //     }
  //   } else if (this.currentStoryIndex !== null && this.currentStoryIndex > index) {
  //     this.currentStoryIndex--;
  //   }
  // }

  deleteStory(index: number): void {
  const storyId = this.stories[index].id!;
  this.storyService.delete(storyId).subscribe(() => {
    this.stories.splice(index, 1);
    if (index === this.currentStoryIndex) {
      this.currentStoryIndex = null;
    }
  });
}


  removeUser(userId: string): void {
    if (!this.isModerator) return;
    
    this.usersInRoom = this.usersInRoom.filter(u => u.id !== userId);
    this.userVoteStatuses.delete(userId);
    
    // Broadcast user removal
    if (this.isConnected) {
      this.webSocketService?.sendMessage({
        action: 'USER_REMOVED',
        roomId: this.tableName,
        userId: userId,
        type: '',
        timestamp: 0
      });
    }
  }

  getInviteLink(): string {
    return `${window.location.origin}/room/${this.planTableId}`;
  }

  copyInviteLink(): void {
    const inviteLink = this.getInviteLink();
    navigator.clipboard.writeText(inviteLink).then(() => {
      // You might want to show a toast notification here
      console.log('Invite link copied to clipboard');
    });
  }

  selectInput(event: Event): void {
    (event.target as HTMLInputElement).select();
  }
}