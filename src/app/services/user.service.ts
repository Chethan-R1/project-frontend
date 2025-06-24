import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
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
    catchError(() => this.createUser({ name, id: '' }))  // If not found, create
  );
}

  getUsersByRoomId(roomId: string): Observable<User[]> {
  return this.http.get<User[]>(`${this.apiUrl}/room/${roomId}`);
}


  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  getUserByName(name: string): Observable<User> {
  return this.http.get<User>(`${this.apiUrl}/name/${name}`);
}


   getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);

   }
}
