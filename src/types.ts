export interface Student {
  id: string;
  name: string;
  classId: string;
}

export interface Room {
  id: string;
  name: string;
  maxCapacity: number;
}

export interface OccupiedSeat {
  row: number;
  column: number;
  student: Student;
}

export interface RoomReport {
  roomId: number | string;
  roomName: string;
  seatingPlan: OccupiedSeat[];
  occupancyRate: number;
  isOverloaded: boolean;
  studentCount: number;
}
