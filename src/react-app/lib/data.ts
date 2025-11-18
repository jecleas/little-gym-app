import { ExerciseTemplate, WorkoutPlan } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 9);
export const today = new Date().toISOString().slice(0, 10);

export const exerciseTemplates: ExerciseTemplate[] = [
  { id: "bench", name: "Bench Press", muscleGroup: "Chest" },
  { id: "incline_db", name: "Incline Dumbbell Press", muscleGroup: "Chest" },
  { id: "lat_pulldown", name: "Lat Pulldown", muscleGroup: "Back" },
  { id: "seated_row", name: "Seated Row", muscleGroup: "Back" },
  { id: "squat", name: "Squat", muscleGroup: "Legs" },
  { id: "leg_ext", name: "Leg Extension", muscleGroup: "Legs" },
  { id: "leg_curl", name: "Seated Leg Curl", muscleGroup: "Legs" },
  { id: "db_shoulder", name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders" },
  { id: "bb_bicep", name: "Bicep Curl (Barbell)", muscleGroup: "Arms" },
  { id: "bb_skull", name: "Skull Crusher (Barbell)", muscleGroup: "Arms" },
  { id: "incline_bb", name: "Incline Barbell", muscleGroup: "Chest" },
  { id: "bb_bent_row", name: "Bent Over Row", muscleGroup: "Back" },
  { id: "pulldown_cg", name: "Lat Pulldown (Closed Grip)", muscleGroup: "Back" },
  { id: "deadlift", name: "Deadlift", muscleGroup: "Legs" },
  { id: "leg_press_incline", name: "Incline Leg Press", muscleGroup: "Legs" },
  { id: "upright_row", name: "Upright Row", muscleGroup: "Shoulders" },
  { id: "cable_curl", name: "Cable Curls", muscleGroup: "Arms" },
  { id: "cable_pressdown", name: "Cable Pressdowns", muscleGroup: "Arms" },
];

// central list of muscle groups for UI selection
export const muscleGroups = ["Chest", "Back", "Legs", "Arms", "Shoulders"] as const;

// initial plans
export const initialPlans: WorkoutPlan[] = [
  {
    id: "chest-back-a",
    name: "Chest + Back \u201cA\u201d",
    description: undefined,
    exercises: [
      { id: uid(), name: "Bench", targetSets: 3, targetReps: 10 },
      { id: uid(), name: "Incline dumbbell", targetSets: 3, targetReps: 10 },
      { id: uid(), name: "Lat pulldown", targetSets: 3, targetReps: 10 },
      { id: uid(), name: "Seated row", targetSets: 3, targetReps: 10 },
    ],
  },
  {
    id: "legs-core-a",
    name: "Legs + Core \u201cA\u201d",
    exercises: [
      { id: uid(), name: "Squats", targetSets: 3, targetReps: 10 },
      { id: uid(), name: "Leg extension", targetSets: 3, targetReps: 12 },
      { id: uid(), name: "Seated Leg curl", targetSets: 3, targetReps: 12 },
    ],
  },
  {
    id: "shoulders-arms-a",
    name: "Shoulders + Arms \u201cA\u201d",
    exercises: [
      { id: uid(), name: "Dumbbell shoulder", targetSets: 3, targetReps: 10 },
      { id: uid(), name: "Bicep curl (barbell)", targetSets: 3, targetReps: 12 },
      { id: uid(), name: "Skull crusher (barbell)", targetSets: 3, targetReps: 12 },
    ],
  },
  {
    id: "chest-back-b",
    name: "Chest + Back \u201cB\u201d",
    exercises: [
      { id: uid(), name: "Incline barbell", targetSets: 3, targetReps: 10 },
      { id: uid(), name: "Bent over row", targetSets: 3, targetReps: 10 },
      { id: uid(), name: "Lat pulldown (closed grip)", targetSets: 3, targetReps: 10 },
    ],
  },
  {
    id: "legs-core-b",
    name: "Legs + Core \u201cB\u201d",
    exercises: [
      { id: uid(), name: "Deadlift", targetSets: 3, targetReps: 10 },
      { id: uid(), name: "Incline leg press", targetSets: 3, targetReps: 10 },
    ],
  },
  {
    id: "shoulders-arms-b",
    name: "Shoulders + Arms \u201cB\u201d",
    exercises: [
      { id: uid(), name: "Upright row", targetSets: 3, targetReps: 10 },
      { id: uid(), name: "Cable curls", targetSets: 3, targetReps: 12 },
      { id: uid(), name: "Cable pressdowns", targetSets: 3, targetReps: 12 },
    ],
  },
];
