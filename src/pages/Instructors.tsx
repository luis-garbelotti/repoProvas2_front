import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  Teacher,
  TeacherDisciplines,
  Test,
  TestByTeacher,
} from "../services/api";
import { updateView } from "../utils/updateView";

function Instructors() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [teachersDisciplines, setTeachersDisciplines] = useState<
    TestByTeacher[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [teacher, setTeacher] = useState<string>('');
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByTeacher(token);
      setTeachersDisciplines(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
      const { data: teachersData } = await api.getTeachers(token);
      setAllTeachers(teachersData.teachers)
    }
    loadPage();
  }, [token]);

  const handleChange = (event: SelectChangeEvent) => {
    setTeacher(event.target.value as string);
  };

  async function handleTeacherClick(teacherId: number) {
    if (!token) return;

    const { data: teacherTests } = await api.getTestsByTeacherId(token, teacherId);
    setTeachersDisciplines(teacherTests.tests)
  }

  return (
    <>
      <Box sx={{ minWidth: 120, width: 500, m: "auto", mb: "15px" }}>
      <FormControl fullWidth>
        <InputLabel id="teacher-select-label">Pesquise por instrutor</InputLabel>
        <Select
          labelId="teacher-select-label"
          id="demo-simple-select"
          value={teacher}
          label="Age"
          onChange={handleChange}
        >
          {allTeachers?.map((teacher) => 
            <MenuItem value={teacher.id} onClick={() => handleTeacherClick(teacher.id)} >{teacher.name}</MenuItem>
          )}
        </Select>
      </FormControl>
      </Box>
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TeachersDisciplinesAccordions
          categories={categories}
          teachersDisciplines={teachersDisciplines}
        />
      </Box>
    </>
  );
}

interface TeachersDisciplinesAccordionsProps {
  teachersDisciplines: TestByTeacher[];
  categories: Category[];
}

function TeachersDisciplinesAccordions({
  categories,
  teachersDisciplines,
}: TeachersDisciplinesAccordionsProps) {
  const teachers = getUniqueTeachers(teachersDisciplines);

  return (
    <Box sx={{ marginTop: "50px" }}>
      {teachers.map((teacher) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={teacher}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{teacher}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {categories
              .filter(doesCategoryHaveTests(teacher, teachersDisciplines))
              .map((category) => (
                <Categories
                  key={category.id}
                  category={category}
                  teacher={teacher}
                  teachersDisciplines={teachersDisciplines}
                />
              ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

function getUniqueTeachers(teachersDisciplines: TestByTeacher[]) {
  return [
    ...new Set(
      teachersDisciplines.map(
        (teacherDiscipline) => teacherDiscipline.teacher.name
      )
    ),
  ];
}

function doesCategoryHaveTests(
  teacher: string,
  teachersDisciplines: TeacherDisciplines[]
) {
  return (category: Category) =>
    teachersDisciplines.filter(
      (teacherDiscipline) =>
        teacherDiscipline.teacher.name === teacher &&
        testOfThisCategory(teacherDiscipline, category)
    ).length > 0;
}

function testOfThisCategory(
  teacherDiscipline: TeacherDisciplines,
  category: Category
) {
  return teacherDiscipline.tests.some(
    (test) => test.category.id === category.id
  );
}

async function handleViewClick(testId: number) {
  await updateView(testId);
}

interface CategoriesProps {
  teachersDisciplines: TeacherDisciplines[];
  category: Category;
  teacher: string;
}

function Categories({
  category,
  teachersDisciplines,
  teacher,
}: CategoriesProps) {
  return (
    <>
      <Box sx={{ marginBottom: "8px" }}>
        <Typography fontWeight="bold">{category.name}</Typography>
        {teachersDisciplines
          .filter(
            (teacherDiscipline) => teacherDiscipline.teacher.name === teacher
          )
          .map((teacherDiscipline) => (
            <Tests
              key={teacherDiscipline.id}
              tests={teacherDiscipline.tests.filter(
                (test) => test.category.id === category.id
              )}
              disciplineName={teacherDiscipline.discipline.name}
            />
          ))}
      </Box>
    </>
  );
}

interface TestsProps {
  disciplineName: string;
  tests: Test[];
}

function Tests({ tests, disciplineName }: TestsProps) {
  return (
    <>
      {tests.map((test) => (
        <Box component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography key={test.id} color="#878787" onClick={() => handleViewClick(test.id)}>
          <Link
            href={test.pdfUrl}
            target="_blank"
            underline="none"
            color="inherit"
          >{`${test.name} (${disciplineName})`}</Link>
          </Typography>
          <Box component="div" color="#878787" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography > {test.views} </Typography>
            <VisibilityOutlinedIcon sx={{ fontSize: "medium" }} />
          </Box>
        </Box>
      ))}
    </>
  );
}

export default Instructors;
