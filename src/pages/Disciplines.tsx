import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { SelectChangeEvent } from '@mui/material/Select';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  Discipline,
  DisciplinesData,
  TeacherDisciplines,
  Test,
  TestByDiscipline,
} from "../services/api";
import { updateView } from "../utils/updateView";

function Disciplines() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [terms, setTerms] = useState<TestByDiscipline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discipline, setDiscipline] = useState<string>('');
  const [allDisciplines, setAllDisciplines] = useState<DisciplinesData[]>([]);

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByDiscipline(token);
      setTerms(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
      const { data: disciplinesData } = await api.getDisciplines(token);
      setAllDisciplines(disciplinesData.disciplines)
    }
    loadPage();
  }, [token]);

  const handleChange = (event: SelectChangeEvent) => {
    setDiscipline(event.target.value as string);
  };

  async function handleDisciplineClick(disciplineId: number) {
    if (!token) return;
    const { data: disciplineTests } = await api.getTestsByDisciplineId(token, disciplineId);
    setTerms(disciplineTests.tests) 
  }

  return (
    <>
      <Box sx={{ minWidth: 120, width: 500, m: "auto", mb: "15px" }}>
        <FormControl fullWidth>
          <InputLabel id="discipline-select-label">Pesquise por disciplina</InputLabel>
          <Select
            labelId="discipline-select-label"
            id="discipline-simple-select"
            value={discipline}
            label="Age"
            onChange={handleChange}
          >
            {allDisciplines?.map((discipline) =>
              <MenuItem value={discipline.id} onClick={() => handleDisciplineClick(discipline.id)} >{discipline.name}</MenuItem>
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
            variant="contained"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TermsAccordions categories={categories} terms={terms} />
      </Box>
    </>
  );
}

interface TermsAccordionsProps {
  categories: Category[];
  terms: TestByDiscipline[];
}

function TermsAccordions({ categories, terms }: TermsAccordionsProps) {
  return (
    <Box sx={{ marginTop: "50px" }}>
      {terms.map((term) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={term.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{term.number} Período</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DisciplinesAccordions
              categories={categories}
              disciplines={term.disciplines}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

interface DisciplinesAccordionsProps {
  categories: Category[];
  disciplines: Discipline[];
}

function DisciplinesAccordions({
  categories,
  disciplines,
}: DisciplinesAccordionsProps) {
  if (disciplines.length === 0)
    return <Typography>Nenhuma prova para esse período...</Typography>;

  return (
    <>
      {disciplines.map((discipline) => (
        <Accordion
          sx={{ backgroundColor: "#FFF", boxShadow: "none" }}
          key={discipline.id}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{discipline.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Categories
              categories={categories}
              teachersDisciplines={discipline.teacherDisciplines}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}

interface CategoriesProps {
  categories: Category[];
  teachersDisciplines: TeacherDisciplines[];
}

function Categories({ categories, teachersDisciplines }: CategoriesProps) {
  if (teachersDisciplines.length === 0)
    return <Typography>Nenhuma prova para essa disciplina...</Typography>;

  return (
    <>
      {categories
        .filter(doesCategoryHaveTests(teachersDisciplines))
        .map((category) => (
          <Box key={category.id}>
            <Typography fontWeight="bold">{category.name}</Typography>
            <TeachersDisciplines
              categoryId={category.id}
              teachersDisciplines={teachersDisciplines}
            />
          </Box>
        ))}
    </>
  );
}

interface TeacherDisciplineProps {
  teachersDisciplines: TeacherDisciplines[];
  categoryId: number;
}

function doesCategoryHaveTests(teachersDisciplines: TeacherDisciplines[]) {
  return (category: Category) =>
    teachersDisciplines.filter((teacherDiscipline) =>
      someTestOfCategory(teacherDiscipline.tests, category.id)
    ).length > 0;
}

function someTestOfCategory(tests: Test[], categoryId: number) {
  return tests.some((test) => test.category.id === categoryId);
}

function testOfCategory(test: Test, categoryId: number) {
  return test.category.id === categoryId;
}

async function handleViewClick(testId: number) {
  await updateView(testId);
}

function TeachersDisciplines({
  categoryId,
  teachersDisciplines,
}: TeacherDisciplineProps) {
  const testsWithDisciplines = teachersDisciplines.map((teacherDiscipline) => ({
    tests: teacherDiscipline.tests,
    teacherName: teacherDiscipline.teacher.name,
  }));

  return (
    <Tests categoryId={categoryId} testsWithTeachers={testsWithDisciplines} />
  );
}

interface TestsProps {
  testsWithTeachers: { tests: Test[]; teacherName: string }[];
  categoryId: number;
}

function Tests({
  categoryId,
  testsWithTeachers: testsWithDisciplines,
}: TestsProps) {
  return (
    <>
      {testsWithDisciplines.map((testsWithDisciplines) =>
        testsWithDisciplines.tests
          .filter((test) => testOfCategory(test, categoryId))
          .map((test) => (
            <Box component="div" sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <Typography key={test.id} color="#878787" onClick={() => handleViewClick(test.id)}>
                <Link
                  href={test.pdfUrl}
                  target="_blank"
                  underline="none"
                  color="inherit"
                >{`${test.name} (${testsWithDisciplines.teacherName})`}</Link>
              </Typography>
              <Box component="div" color="#878787" sx={{ display: "flex", alignItems: "center", gap: 1}}>
                <Typography > {test.views} </Typography> 
                <VisibilityOutlinedIcon sx={{fontSize: "medium"}}/>
              </Box>
            </Box>
          ))
      )}
    </>
  );
}

export default Disciplines;
