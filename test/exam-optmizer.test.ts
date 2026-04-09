import { describe, it, expect, beforeEach } from "vitest";
import { ExamOptimizer } from "../src";
import type { Student, Room } from "../src";

describe("ExamOptimizer", () => {
  let optimizer: ExamOptimizer;
  let mockStudents: Student[];
  let mockRooms: Room[];

  beforeEach(() => {
    optimizer = new ExamOptimizer(0.8);

    mockStudents = [
      { id: "1", name: "Alice", classId: "MATH101" },
      { id: "2", name: "Bob", classId: "MATH101" },
      { id: "3", name: "Charlie", classId: "PHY101" },
      { id: "4", name: "Diana", classId: "PHY101" },
    ];

    mockRooms = [
      { id: "L1", name: "Local 1", maxCapacity: 10 },
      { id: "L2", name: "Local 2", maxCapacity: 2 },
    ];
  });

  it("should correctly allocate students without overloading", () => {
    const reports = optimizer.generateSeatingPlan(mockStudents, mockRooms, 2);

    expect(reports.length).toBeGreaterThan(0);

    const totalAllocated = reports.reduce((sum, r) => sum + r.studentCount, 0);
    expect(totalAllocated).toBe(mockStudents.length);

    reports.forEach((report) => {
      expect(report.isOverloaded).toBe(false);
      expect(report.occupancyRate).toBeLessThanOrEqual(1);
    });
  });

  it("should throw an error if total room capacity is insufficient", () => {
    const tinyRooms: Room[] = [{ id: "R3", name: "Closet", maxCapacity: 1 }];

    expect(() => {
      optimizer.generateSeatingPlan(mockStudents, tinyRooms, 2);
    }).toThrow("Insufficient capacity");
  });

  it("should separate students from the same class", () => {
    const reports = optimizer.generateSeatingPlan(mockStudents, mockRooms, 2);
    const plan = reports[0].seatingPlan;

    if (reports.length >=2 && plan.length >= 2) {
      // Because of round-robin, adjacent students (index 0 and 1) should have different classes
      expect(plan[0].student.classId).not.toEqual(plan[1].student.classId);
    }
  });

  it("should respect individual room capacities when distributing", () => {
    // 8 students
    const moreStudents: (Student& {className?: string})[] = [
      ...mockStudents,
      { id: "5", name: "Eve", classId: "BIO101", className:"Biologie" },
      { id: "6", name: "Frank", classId: "BIO101" },
      { id: "7", name: "Shomari", classId: "BIO102" },
      { id: "8", name: "Bienfait", classId: "BIO103" },
      { id: "9", name: "Alvine", classId: "BIO103" },
    ];
    
    // L1: 10, L2: 2
    const reports = optimizer.generateSeatingPlan(moreStudents, mockRooms, 2);
    const labAReport = reports.find(r => r.roomId === "L2");
    expect(labAReport).toBeDefined();
    expect(labAReport!.studentCount).toBeLessThanOrEqual(2);
  });
});
