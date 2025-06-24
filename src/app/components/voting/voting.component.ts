import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StoryService } from '../../services/story.service';
import { Story } from '../../models/story.model';
import { PlanningTableService } from '../../services/planning-table.service';
import { User } from '../../models/user.model';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';

interface Vote {
  voteId: number;
  user: { username: string };
  voteValue: number | string;
}

interface DisplayStory {
  storyId: number;
  storyName: string;
}

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.css']
})
export class VotingComponent implements OnInit {
  roomId: string = '';
  planTableId: string = '';
  votes: (number | string)[] = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, '?'];
  selectedVote: Vote[] = [];
  story: string = '';
  stories: DisplayStory[] = [];
  currentStoryIndex: number | null = null;
  editingIndex: number | null = null;
  storyEditText: string = '';
  tableName: string = '';
  usersInRoom: User[] = [];

  

  timer: number = 0;
  timerInterval: any;
  votingStarted: boolean = false;
  // userService: any;

  constructor(private route: ActivatedRoute,
     private storyService: StoryService,
    private planningTableService: PlanningTableService,
    private http: HttpClient,                    
    private userService: UserService  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId') || '';
    const match = this.roomId.match(/(\d+)$/);
    this.planTableId = localStorage.getItem('selectedTableId') || '';
    // const plantableId = this.planTableId;
    this.planTableId = this.roomId;

  console.log('Full route param (roomId):', this.roomId);
  console.log('Extracted numeric planTableId:', this.planTableId);

  localStorage.setItem('selectedTableId', this.planTableId);

    this.loadTableName();
    this.loadStories();
    this.addMemberToRoom();     
    this.loadUsersInRoom();
    // this.loadUsersInRoom();
  }

  loadTableName() {
  this.planningTableService.getById(this.planTableId).subscribe({
    next: (table) => {
      this.tableName = table.tableName;
    },
    error: (err) => {
      console.error('Failed to fetch table by ID', err);
      this.tableName = this.planTableId;
    }
  });
}


  loadStories() {
    this.storyService.getByRoomId(this.planTableId).subscribe(data => {
      console.log(data)
      this.stories = data.map(story => ({
        storyId: story.storyId,
        storyName: story.title
      }));
    });
  }

  addStory() {
  const userId = localStorage.getItem('userId');
  const plantableId = this.planTableId;
  // const plantableId=localStorage.getItem('selectedTableId')
  console.log("add story clicked")
  console.log(this.story)
  if (this.story.trim() && userId) {
    const newStory = {
      title: this.story,
      description: '',
      planTable: { id: plantableId},
      createdBy: { userId: userId } 
    };
    console.log("New story",newStory)

    this.storyService.create(newStory).subscribe({
      next: (createdStory: Story) => {
        console.log("Story creadted",createdStory);
        // this.stories.push({ storyId: createdStory.storyId, storyName: createdStory.title });
        // this.story = '';
        this.loadStories();
      },
      error: (err) => {
        console.error('Failed to create story:', err);
        alert(err.error || 'Could not add story. Please make sure the room exists and you are the owner.');
      }
    });
  }
}


  setStory(index: number) {
    this.currentStoryIndex = index;
    this.selectedVote = [];
    this.stopTimer();
    this.timer = 0;
    this.votingStarted = false;
  }

  startVoting() {
    if (this.currentStoryIndex !== null) {
      this.selectedVote = [];
      this.votingStarted = true;
      this.stopTimer();
      this.timer = 0;
      this.timerInterval = setInterval(() => this.timer++, 1000);
    }
  }

  stopVoting() {
    this.stopTimer();
    this.votingStarted = false;
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  vote(value: number | string) {
    if (!this.votingStarted || this.currentStoryIndex === null) return;
    const user = localStorage.getItem('user') || 'User';
    this.selectedVote.push({
      voteId: Date.now(),
      user: { username: user },
      voteValue: value
    });
  }

  editStory(index: number) {
    this.editingIndex = index;
    this.storyEditText = this.stories[index].storyName;
  }

  saveEditedStory() {
    if (this.editingIndex !== null) {
      const storyId = this.stories[this.editingIndex].storyId;
      const updatedStory = {
        title: this.storyEditText,
        description: ''
      };
      this.storyService.update(storyId, updatedStory).subscribe(() => {
        this.stories[this.editingIndex!].storyName = this.storyEditText;
        this.cancelEdit();
      });
    }
  }

  cancelEdit() {
    this.editingIndex = null;
    this.storyEditText = '';
  }

  deleteStory(index: number) {
    const storyId = this.stories[index].storyId;
    this.storyService.delete(storyId).subscribe(() => {
      if (index === this.currentStoryIndex) {
        this.currentStoryIndex = null;
      }
      this.stories.splice(index, 1);
    });
  }

  clearVotes() {
    this.selectedVote = [];
  }

  getTimerFormatted(): string {
    const m = Math.floor(this.timer / 60).toString().padStart(2, '0');
    const s = (this.timer % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  getInviteLink(): string {
    return `${window.location.origin}/room/${this.roomId}`;
  }

  copyInviteLink() {
    navigator.clipboard.writeText(this.getInviteLink());
    alert('Link copied!');
  }

  selectInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  addMemberToRoom() {
  const userId = localStorage.getItem('userId');
  const tableId = this.planTableId;

  if (userId && tableId) {
    this.http.post('http://localhost:8080/api/members', {
      userId,
      tableId
    }).subscribe({
      next: () => {
        console.log('User added or already present');
        this.loadUsersInRoom(); // refresh list after adding
      },
      error: (err) => console.error('Error adding user to room', err)
    });
  }
}


//   loadUsersInRoom() {
//   this.userService.getUsersByRoomId(this.planTableId).subscribe({
//     next: (users: User[]) => {
//       this.usersInRoom = users;
//     },
//     error: (err: any) => {
//       console.error('Failed to load users in room', err);
//     }
//   });
// }

loadUsersInRoom() {
  this.userService.getUserByRoomId(this.planTableId).subscribe({
    next: (users: User[]) => this.usersInRoom = users,
    error: (err: any) => console.error('Failed to load users:', err)
  });
}

}
