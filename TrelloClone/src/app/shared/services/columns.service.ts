import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ColumnRequestInterface } from '../types/columnRequest.interface';
import { ColumnInterface } from '../types/columns.interface';
import { SocketEventEnum } from '../types/socketEvents.enum';
import { SocketService } from './socket.service';

@Injectable()
export class ColumnsService {
  columnsUrl = environment.apiURL;
  constructor(private http: HttpClient, private socketService: SocketService) {}

  getColumns(boardId: string): Observable<ColumnInterface[]> {
    return this.http.get<ColumnInterface[]>(
      `${this.columnsUrl}boards/${boardId}/columns`
    );
  }

  createColumn(columninput: ColumnRequestInterface): void {
    this.socketService.emit(SocketEventEnum.columnsCreate, columninput);
  }

  updateColumn(
    boardId: string,
    columnId: string,
    fields: { title: string }
  ): void {
    this.socketService.emit(SocketEventEnum.columnsUpdate, {
      boardId,
      columnId,
      fields,
    });
  }

  deleteColumn(boardId: string, columnId: string): void {
    this.socketService.emit(SocketEventEnum.columnsDelete, {
      boardId,
      columnId,
    });
  }
}
