import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users'; 

  constructor(private http: HttpClient) {}

  getUserByRoomId(roomId: string): Observable<User[]> {
    return this.http.get<User[]>(`http://localhost:8080/api/members/users/${roomId}`);
  }

  getOrCreateUser(name: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/name/${name}`).pipe(
      catchError(() => this.createUser({ name,username:'', id: '',moderator:false }))
    );
  }

  getUsersByRoomId(roomId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/room/${roomId}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /** ✅ Fixed create method */
  create(newUser: { name: string; email: string; password: string }): Observable<User> {
    return this.http.post<User>(this.apiUrl, newUser);
  }

  getUserByName(name: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/name/${name}`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  removeUserFromTable(userId: string, tableId: string): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/members/${tableId}/${userId}`);
  }

  signup(user: { name: string; email: string; password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/signup`, user);
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials);
  }
}
