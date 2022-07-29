export interface TaskInterface {
    id: string;
    title: string;
    description?: string;
    userId: string;
    columnId: string;
    boardId: string;
}