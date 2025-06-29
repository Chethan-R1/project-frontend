// src/app/services/story.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Story } from '../models/story.model';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private baseUrl = 'http://localhost:8080/api/stories'; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<Story[]> {
    return this.http.get<Story[]>(this.baseUrl);
  }

    getByRoomId(planTableId: string): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.baseUrl}/planTable/${planTableId}`);
  }

  create(story:any): Observable<Story> {
    return this.http.post<Story>(this.baseUrl, story);
  }

  update(id: string, story: Partial<Story>): Observable<Story> {
    return this.http.put<Story>(`${this.baseUrl}/${id}`, story);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
