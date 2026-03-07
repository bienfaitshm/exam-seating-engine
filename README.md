# Exam Seating Engine

An enterprise-grade, anti-cheating, and cost-optimized student distribution engine. This package automates the complex task of assigning students to exam rooms while maximizing distance between classmates and minimizing the number of proctors needed.

---

## Features

* **Anti-Cheat Logic (Level 3):**
* **Level 1:** Individual student shuffling (Fisher-Yates).
* **Level 2:** Cross-class interleaving (Round-Robin) to ensure neighbors are from different groups.
* **Level 3:** 2D Matrix mapping for physical seating plans.

* **Cost Optimization:** Intelligent room selection prioritizes larger venues to minimize supervision staff.
* **Comfort Ratio:** Configurable buffer (e.g., 80% capacity) to ensure social distancing or extra desk space.
* **Type Safe:** Built with TypeScript for robust integration.

---

## Installation

```bash
npm install exam-seating-engine
# or
yarn add exam-seating-engine

```

---

## Usage

```typescript
import { ExamOptimizer, Student, Room } from 'exam-seating-engine';

const students: Student[] = [
    { id: '1', name: 'John Doe', classId: 'BIO_101' },
    { id: '2', name: 'Jane Smith', classId: 'BIO_101' },
    { id: '3', name: 'Alan Turing', classId: 'MATH_202' },
    // ... more students
];

const rooms: Room[] = [
    { id: 'A1', name: 'Grand Hall', maxCapacity: 100 },
    { id: 'B2', name: 'Small Lab', maxCapacity: 20 }
];

// Initialize with a 70% comfort ratio
const engine = new ExamOptimizer(0.7);

try {
    const reports = engine.generateSeatingPlan(students, rooms, 5); // 5 columns per room
    console.log(reports[0].seatingPlan);
} catch (error) {
    console.error("Failed to generate plan:", error.message);
}

```

---

## Technical Deep Dive (For Contributors)

### The Core Algorithm: "Interleaved Distribution"

To ensure maximum academic integrity, the engine doesn't just shuffle students. It follows a three-step deterministic pipeline:

#### 1. Group & Shuffle

Students are grouped by their `classId`. Each group is internally shuffled using the **Fisher-Yates** algorithm. This ensures that the order within a class is perfectly random and unbiased.

#### 2. Round-Robin Interleaving

Instead of placing all biology students together, the engine picks one student from Class A, then one from Class B, then Class C, and repeats.

This ensures that horizontally and vertically, the probability of having a classmate nearby is mathematically minimized.

#### 3. Greedy Room Selection

The engine uses a "Greedy" approach for room allocation:

1. Sorts rooms by `maxCapacity` (Descending).
2. Calculates `effectiveCapacity = maxCapacity * comfortRatio`.
3. Selects the minimum number of rooms required to satisfy the total student count.

### Data Matrix Structure

The output generates a 1D array mapped to 2D coordinates:

$$Row = \lfloor \frac{index}{columns} \rfloor$$

$$Column = index \pmod{columns}$$

---

## Development & Testing

### Prerequisites

* Node.js 18+
* npm or yarn

### Setup

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Run tests: `npm test`.

### Unit Testing Policy

We use **Jest** for unit testing. Every new feature must:

* Maintain >90% code coverage.
* Pass the "Class Separation" test (ensuring classmates are not adjacent).
* Handle "Insufficient Capacity" edge cases.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b bienfaitshm/exam-seating-engine`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin bienfaitshm/exam-seating-engine`).
5. Open a Pull Request.

---

##  License

Distributed under the MIT License. See `LICENSE` for more information.

---
