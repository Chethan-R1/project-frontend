import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Vote } from '../models/vote.model';

@Injectable({ providedIn: 'root' })
export class VoteService {
  private baseUrl = 'http://localhost:8080/api/votes';

  constructor(private http: HttpClient) {}

   getResults(questionId: number): Observable<{ userName: string; voteValue: number }[]> {
    return this.http.get<{ userName: string; voteValue: number }[]>(
      `${this.baseUrl}/results/${questionId}`
    );
  }

  submit(vote: Partial<Vote>): Observable<Vote> {
    return this.http.post<Vote>(this.baseUrl, vote);
  }

  getByQuestion(questionId: number): Observable<Vote[]> {
    return this.http.get<Vote[]>(`${this.baseUrl}/question/${questionId}`);
  }
}
