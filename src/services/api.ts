import axios from "axios";

const baseAPI = axios.create({
  baseURL: "http://localhost:5000/",
});

interface UserData {
  email: string;
  password: string;
}

function getConfig(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function signUp(signUpData: UserData) {
  await baseAPI.post("/sign-up", signUpData);
}

async function signIn(signInData: UserData) {
  return baseAPI.post<{ token: string }>("/sign-in", signInData);
}

export interface Term {
  id: number;
  number: number;
}

export interface Discipline {
  id: number;
  name: string;
  teacherDisciplines: TeacherDisciplines[];
  term: Term;
}

export interface DisciplinesData {
  id: number,
  name: string
}

export interface TeacherDisciplines {
  id: number;
  discipline: Discipline;
  teacher: Teacher;
  tests: Test[];
}

export interface Teacher {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Test {
  id: number;
  name: string;
  pdfUrl: string;
  category: Category;
  views: number
}

export interface TestData {
  name: string,
  pdfUrl: string,
  categoryId: number,
  teacherDisciplineId: number
}

export type TestByDiscipline = Term & {
  disciplines: Discipline[];
};

export type TestByTeacher = TeacherDisciplines & {
  teacher: Teacher;
  disciplines: Discipline[];
  tests: Test[];
};

async function getTestsByDiscipline(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ tests: TestByDiscipline[] }>(
    "/tests?groupBy=disciplines",
    config
  );
}

async function getTestsByDisciplineId(token: string, disciplineId: number) {
  const config = getConfig(token);
  return baseAPI.get<{ tests: TestByDiscipline[] }>(`/tests/disciplines/${disciplineId}`, config);
}

async function getTestsByTeacher(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ tests: TestByTeacher[] }>(
    "/tests?groupBy=teachers",
    config
  );
}

async function getCategories(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ categories: Category[] }>("/categories", config);
}

async function getTeachers(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ teachers: Teacher[] }>("/teachers", config);
}

async function getTestsByTeacherId(token: string, teacherId: number) {
  const config = getConfig(token);
  return baseAPI.get<{ tests: TestByTeacher[] }>(`/tests/teachers/${teacherId}`, config);
}

async function getDisciplines(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ disciplines: DisciplinesData[] }>("/disciplines", config);
}

async function getTeachersByDisciplineId(token: string, disciplineId: number) {
  const config = getConfig(token);
  return baseAPI.get<{ teachers: Teacher[] }>(`/teachers/disciplines/${disciplineId}`, config);
}

async function updateTestView(testId: number) {
  return baseAPI.put(`/tests/${testId}/update-view`);
}

async function insertTest(token: string, body: TestData) {
  const config = getConfig(token);
  return baseAPI.post<{ body: TestData }>(`/test`, body, config);

}

const api = {
  signUp,
  signIn,
  getTestsByDiscipline,
  getTestsByTeacher,
  getCategories,
  getTeachers,
  getTestsByTeacherId,
  getDisciplines,
  getTestsByDisciplineId,
  updateTestView,
  getTeachersByDisciplineId,
  insertTest
};

export default api;
