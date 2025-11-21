export type ExerciseTemplate = {
  id: string;
  name: string;
  muscleGroup?: string;
  description?: string; // longer textual description / cues
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
  exerciseName?: string; // stored to handle session-only (extra) exercises
  setsDone: number;
  repsPerSet: number[];
  weightsPerSet: number[];
  notes?: string;
};

export type Role = "trainer" | "client";
