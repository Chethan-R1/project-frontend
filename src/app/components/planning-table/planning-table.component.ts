import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanningTable } from '../../models/planning-table.model';
import { PlanningTableService } from '../../services/planning-table.service';

@Component({
  selector: 'app-planning-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning-table.component.html',
  styleUrls: ['./planning-table.component.css']
})
export class PlanningTableComponent implements OnInit {
  tables: PlanningTable[] = [];
  newTableName = '';
  editingTable: PlanningTable | null = null;
  updatedName = '';

  constructor(
    private service: PlanningTableService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTables();
  }

  loadTables(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.service.getByUser(+userId).subscribe({
        next: (tables) => {
          console.log('User-specific tables:', tables);
          this.tables = tables;
        },
        error: (err) => {
          console.error('Failed to load tables', err);
        }
      });
    }
  }

  addTable(): void {
    const userId = localStorage.getItem('userId');
    if (!this.newTableName.trim() || !userId) {
      alert('Table name and user must be present.');
      return;
    }

    const table = {
      tableName: this.newTableName,
      user: { id: +userId }
    };

    this.service.create(table).subscribe({
      next: () => {
        this.newTableName = '';
        this.loadTables();
      },
      error: (err) => {
        console.error('Error creating table', err);
        alert('Could not create table');
      }
    });
  }

  startEdit(table: PlanningTable): void {
    this.editingTable = table;
    this.updatedName = table.tableName || '';
  }

  saveEdit(): void {
    if (!this.editingTable) return;

    const updatePayload = {
      tableName: this.updatedName,
      user: this.editingTable.user  // Retain user info
    };

    this.service.update(this.editingTable.id, updatePayload).subscribe({
      next: () => {
        this.editingTable = null;
        this.updatedName = '';
        this.loadTables();
      },
      error: (err) => {
        console.error('Failed to update table', err);
        alert('Error updating table');
      }
    });
  }

  cancelEdit(): void {
    this.editingTable = null;
    this.updatedName = '';
  }

  deleteTable(id: number): void {
    this.service.delete(id).subscribe({
      next: () => this.loadTables(),
      error: (err) => {
        console.error('Error deleting table', err);
        alert('Could not delete table');
      }
    });
  }

  selectTable(id: number): void {
    localStorage.setItem('selectedTableId', id.toString());
    this.router.navigate([`/room/${id}`]);
  }
}
