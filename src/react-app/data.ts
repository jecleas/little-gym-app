import { ExerciseTemplate, WorkoutPlan } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 9);

export const exerciseTemplates: ExerciseTemplate[] = [
  { id: "squat", name: "Back Squat", muscleGroup: "Legs" },
  { id: "bench", name: "Bench Press", muscleGroup: "Chest" },
  { id: "deadlift", name: "Deadlift", muscleGroup: "Back" },
  { id: "ohp", name: "Overhead Press", muscleGroup: "Shoulders" },
  { id: "pulldown", name: "Lat Pulldown", muscleGroup: "Back" },
  { id: "row", name: "Barbell Row", muscleGroup: "Back" },
  { id: "legpress", name: "Leg Press", muscleGroup: "Legs" },
];

export const defaultPlan: WorkoutPlan = {
  id: "plan-1",
  name: "Full Body A",
  description: "Balanced routine hitting major muscle groups.",
  exercises: [
    { id: uid(), templateId: "squat", name: "Back Squat", targetSets: 4, targetReps: 6 },
    { id: uid(), templateId: "bench", name: "Bench Press", targetSets: 4, targetReps: 8 },
    { id: uid(), templateId: "row", name: "Barbell Row", targetSets: 3, targetReps: 10 },
  ],
};

export const today = new Date().toISOString().slice(0, 10);
