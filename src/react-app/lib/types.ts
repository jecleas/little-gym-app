export type ExerciseTemplate = {
  id: string;
  name: string;
  muscleGroup?: string;
};

export type Exercise = {
  id: string;
  templateId?: string;
  name: string;
  targetSets: number;
  targetReps: number;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
};

export type SessionEntry = {
  id: string;
  planId: string;
  date: string;
  exerciseId: string;
  setsDone: number;
  repsPerSet: number[];
  weight: number;
  notes?: string;
};

export type Role = "trainer" | "client";

