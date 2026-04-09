import { Student, Room, RoomReport, OccupiedSeat } from "./types";
import { shuffleArray } from "./utils";

export class ExamOptimizer {
  private readonly comfortRatio: number;

  /**
   * Initialise le moteur d'optimisation.
   * @param comfortRatio - Ratio de confort cible (défaut: 0.8 pour 80% d'occupation).
   */
  constructor(comfortRatio: number = 0.8) {
    this.comfortRatio = comfortRatio;
  }

  /**
   * Génère un plan de salle optimisé et anti-triche.
   * Remplit les salles de manière séquentielle en respectant le comfortRatio.
   * * @param students - Liste des étudiants à placer.
   * @param rooms - Salles disponibles.
   * @param defaultColumnsPerRoom - Largeur de matrice par défaut si la salle ne la précise pas.
   * @returns Un tableau de rapports détaillés par salle.
   * @throws Error si la capacité totale est insuffisante.
   */
  public generateSeatingPlan<T extends Student>(
    students: T[],
    rooms: Room[],
    defaultColumnsPerRoom: number = 5,
  ): RoomReport<T>[] {
    if (!students.length || !rooms.length) return [];

  const activeRooms = this.selectOptimalRooms(rooms, students.length);
  console.log("Active rooms :", activeRooms.length)
  
  const shuffledStudents = this.interleaveStudents(students);

  const allocations = new Map<string, T[]>();
  activeRooms.forEach((room) => allocations.set(room.id, []));

  let studentIndex = 0;

  // 1. On remplit d'abord chaque salle selon le ratio de confort (ex: 80%)
  for (const room of activeRooms) {
    const roomAllocations = allocations.get(room.id)!;
    const comfortCap = Math.floor(room.maxCapacity * this.comfortRatio);

    while (studentIndex < shuffledStudents.length && roomAllocations.length < comfortCap) {
      roomAllocations.push(shuffledStudents[studentIndex]);
      studentIndex++;
    }
  }

  // 2. S'il reste des étudiants (car le ratio de confort est atteint partout), 
  // on utilise les places restantes jusqu'à 100% de la capacité brute.
  for (const room of activeRooms) {
    const roomAllocations = allocations.get(room.id)!;
    while (studentIndex < shuffledStudents.length && roomAllocations.length < room.maxCapacity) {
      roomAllocations.push(shuffledStudents[studentIndex]);
      studentIndex++;
    }
  }

  return activeRooms.map((room) =>
    this.buildRoomReport<T>(
      room,
      allocations.get(room.id) || [],
      room.columns ?? defaultColumnsPerRoom,
    ),
  ).sort((a, b) => a.roomName.localeCompare(b.roomName));
  }

  /**
   * Groupe, mélange aléatoirement et entrelace les étudiants pour maximiser 
   * la distance physique entre les membres d'une même classe.
   * * @param students - Liste globale des étudiants.
   * @returns Une liste linéaire d'étudiants entrelacés.
   */
  private interleaveStudents<T extends Student>(students: T []): T[] {
    const groups: Record<string, T[]> = {};

    for (const student of students) {
      if (!groups[student.classId]) groups[student.classId] = [];
      groups[student.classId].push(student);
    }

    const classIds = Object.keys(groups);
    let maxStudentsInClass = 0;

    for (const key of classIds) {
      groups[key] = shuffleArray(groups[key]);
      if (groups[key].length > maxStudentsInClass) {
        maxStudentsInClass = groups[key].length;
      }
    }

    const result: T[] = [];

    // Entrelacement Round-Robin
    for (let i = 0; i < maxStudentsInClass; i++) {
      for (const classId of classIds) {
        if (groups[classId][i]) {
          result.push(groups[classId][i]);
        }
      }
    }

    return result;
  }

/**
   * Sélectionne les salles en utilisant la capacité de confort comme métrique.
   * On trie par capacité décroissante pour minimiser le nombre de salles (et donc de surveillants).
   * * @param rooms - Liste des salles disponibles.
   * @param totalStudentsNeeded - Nombre total d'étudiants à placer.
   * @returns Un sous-ensemble de salles suffisant pour respecter le comfortRatio.
   * @throws Error si même à 100% de capacité, on ne peut pas loger tout le monde.
   */
  private selectOptimalRooms(
    rooms: Room[],
    totalStudentsNeeded: number,
  ): Room[] {
    const sortedRooms = [...rooms].sort(
      (a, b) => b.maxCapacity - a.maxCapacity,
    );
    
    const selectedRooms: Room[] = [];
    let accumulatedComfortCapacity = 0;

    for (const room of sortedRooms) {
      selectedRooms.push(room);

      const effectiveComfortCapacity = Math.floor(room.maxCapacity * this.comfortRatio);
      
      accumulatedComfortCapacity += effectiveComfortCapacity;

      if (accumulatedComfortCapacity >= totalStudentsNeeded) {
        return selectedRooms;
      }
    }

    // Si on arrive ici, le ratio de confort n'est pas tenable.
    // On vérifie si c'est possible en utilisant 100% de la capacité brute.
    const totalRawCapacity = selectedRooms.reduce((sum, r) => sum + r.maxCapacity, 0);

    if (totalRawCapacity < totalStudentsNeeded) {
      throw new Error(
        `Insufficient capacity. Need space for ${totalStudentsNeeded} students, but total capacity is only ${totalRawCapacity}.`,
      );
    }

    // Si on est entre la capacité de confort et la capacité brute, 
    // on renvoie quand même les salles, l'allocateur gérera le surplus.
    return selectedRooms;
  }

  /**
   * Formate les données d'une salle avec le placement matriciel des étudiants.
   */
  private buildRoomReport<T extends Student>(
    room: Room,
    students: T[],
    columns: number,
  ): RoomReport<T> {
    const seatingPlan: OccupiedSeat<T>[] = students.map((student, index) => ({
      row: Math.floor(index / columns),
      column: index % columns,
      student,
    })).sort((a, b)=>a.student.name.localeCompare(b.student.name))

    const occupancyRate = students.length / room.maxCapacity;

    return {
      roomId: room.id,
      roomName: room.name,
      maxCapacity: room.maxCapacity,
      seatingPlan,
      studentCount: students.length,
      occupancyRate: Number(occupancyRate.toFixed(2)),
      isOverloaded: students.length > room.maxCapacity,
    };
  }
}