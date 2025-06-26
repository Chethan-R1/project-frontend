import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Vote {
  id?: number;
  userId: string;
  storyId: string;
  voteValue: string;
  timestamp?: string;
}

export interface VoteRequest {
  userId: string;
  storyId: string;
  voteValue: string;
}

@Injectable({ providedIn: 'root' })
export class VoteService {
  // private baseUrl = 'http://localhost:8080/api/votes';

  // constructor(private http: HttpClient) {}

  //  getResults(questionId: number): Observable<{ userName: string; voteValue: number }[]> {
  //   return this.http.get<{ userName: string; voteValue: number }[]>(
  //     `${this.baseUrl}/results/${questionId}`
  //   );
  // }

  // submit(vote: Partial<Vote>): Observable<Vote> {
  //   return this.http.post<Vote>(this.baseUrl, vote);
  // }

  // getByQuestion(questionId: number): Observable<Vote[]> {
  //   return this.http.get<Vote[]>(`${this.baseUrl}/question/${questionId}`);
  // }

   private apiUrl = 'http://localhost:8080/api/votes';

  constructor(private http: HttpClient) {}

  castVote(request: VoteRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/cast`, request);
  }

  revealVotes(storyId: string): Observable<Vote[]> {
    return this.http.post<Vote[]>(`${this.apiUrl}/reveal/${storyId}`, {});
  }

  resetVotes(storyId: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/reset/${storyId}`, {}, { responseType: 'text' });
  }
}
