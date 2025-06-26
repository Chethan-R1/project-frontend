import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { WebSocketMessage } from '../models/WebSocketMessage.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private currentRoomId: string | null = null;
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private messageSubject = new BehaviorSubject<WebSocketMessage | null>(null);

  constructor() {}

  connect(roomId: string): void {
  this.currentRoomId = roomId;
  console.log('[WebSocketService] Attempting connection to room:', roomId);

  this.stompClient = new Client({
    webSocketFactory: () => {
      console.log('[WebSocketService] Creating SockJS connection to /ws/voting');
      return new SockJS('http://localhost:8080/ws/voting');
    },
    debug: (str) => {
      console.log('[STOMP DEBUG]', str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000
  });

  this.stompClient.onConnect = (frame) => {
    console.log('[WebSocketService] Connected:', frame);
    this.connectionStatus.next(true);

    const topic = `/topic/room/${roomId}`;
    console.log(`[WebSocketService] Subscribing to topic: ${topic}`);

    this.stompClient.subscribe(topic, (message: IMessage) => {
      console.log('[WebSocketService] Message received:', message.body);
      try {
        const payload: WebSocketMessage = JSON.parse(message.body);
        this.messageSubject.next(payload);
      } catch (err) {
        console.error('[WebSocketService] Error parsing message:', err);
      }
    });

    // Send join message
    const joinMessage = {
      action: 'JOIN_ROOM',
      roomId: roomId,
      type: 'JOIN',
      timer: 0,
       timestamp: Date.now()
    };
    console.log('[WebSocketService] Sending join message:', joinMessage);
    this.sendMessage(joinMessage);
  };

  this.stompClient.onStompError = (frame) => {
    console.error('[WebSocketService] STOMP error:', frame.headers['message']);
    console.error('[WebSocketService] Details:', frame.body);
    this.connectionStatus.next(false);
  };

  this.stompClient.onWebSocketError = (evt) => {
    console.error('[WebSocketService] WebSocket error:', evt);
  };

  this.stompClient.onWebSocketClose = (evt) => {
    console.warn('[WebSocketService] WebSocket closed:', evt);
  };

  console.log('[WebSocketService] Activating STOMP client...');
  this.stompClient.activate();
}


  disconnect(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
      this.connectionStatus.next(false);
      this.currentRoomId = null;
    }
  }

  sendMessage(message: WebSocketMessage): void {
    if (this.stompClient && this.stompClient.connected && this.currentRoomId) {
      this.stompClient.publish({
        destination: `/app/room/${this.currentRoomId}`,
        body: JSON.stringify(message)
      });
    } else {
      console.warn('STOMP not connected. Message not sent.');
    }
  }

  castVote(userId: string, storyId: string, vote: string): void {
    this.sendMessage({
      action: 'VOTE',
      roomId: this.currentRoomId!,
      userId,
      storyId,
      vote,
      type: '',
      timer: 0,
      timestamp: 0
    });
  }

  revealVotes(): void {
    this.sendMessage({
      action: 'REVEAL_VOTES',
      roomId: this.currentRoomId!,
      type: '',
      timer: 0,
      timestamp: 0
    });
  }

  resetVotes(): void {
    this.sendMessage({
      action: 'RESET_VOTES',
      roomId: this.currentRoomId!,
      type: '',
      timer: 0,
      timestamp: 0
    });
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  getMessages(): Observable<WebSocketMessage | null> {
    return this.messageSubject.asObservable();
  }

  isConnected(): boolean {
    return this.connectionStatus.value;
  }
}
