import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlanningTable } from '../models/planning-table.model';

@Injectable({
  providedIn: 'root'
})
export class PlanningTableService {
  private apiUrl = 'http://localhost:8080/api/rooms';

  constructor(private http: HttpClient) {}

  getById(id: string): Observable<PlanningTable> {
  return this.http.get<PlanningTable>(`${this.apiUrl}/${id}`);
}


  getByUser(userId: string): Observable<PlanningTable[]> {
  return this.http.get<PlanningTable[]>(`${this.apiUrl}/user/${userId}`);
}


  // getAll(): Observable<PlanningTable[]> {
  //   return this.http.get<PlanningTable[]>(this.apiUrl);
  // }

  create(table: Partial<PlanningTable>): Observable<PlanningTable> {
    return this.http.post<PlanningTable>(this.apiUrl, table);
  }

  update(id: number, table: Partial<PlanningTable>): Observable<PlanningTable> {
    return this.http.put<PlanningTable>(`${this.apiUrl}/${id}`, table);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
