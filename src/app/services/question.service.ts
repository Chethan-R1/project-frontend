import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Question } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private baseUrl = 'http://localhost:8080/api/questions';

  constructor(private http: HttpClient) {}

  create(question: Partial<Question>): Observable<Question> {
    return this.http.post<Question>(this.baseUrl, question);
  }

  getByStory(storyId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/story/${storyId}`);
  }
}
