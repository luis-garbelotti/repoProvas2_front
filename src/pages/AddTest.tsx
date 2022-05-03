import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAlert from "../hooks/useAlert";
import useAuth from "../hooks/useAuth";
import api, { Category, DisciplinesData, TestData} from "../services/api";

function AddTest() {

    const { token } = useAuth();
    const { setMessage } = useAlert();
    const navigate = useNavigate()

    const [textFieldData, setTextFieldData] = useState({name: '', pdfUrl: ''})

    const [categoriesData, setCategoriesData] = useState<Category[]>([]);
    const [category, setCategory] = useState<string>('');
    const [categoryId, setCategoryId] = useState<number>(0);

    const [disciplinesData, setDisciplinesData] = useState<DisciplinesData[]>([]);
    const [discipline, setDiscipline] = useState<string>('');
    
    const [allTeachersData, setAllTeachersData] = useState<any[]>([]);
    const [teacher, setTeacher] = useState<string>('');

    const [testData, setTestData] = useState<TestData>()
    
    const [disableDiscipline, setDisableDiscipline] = useState<boolean>(true);
    const [disableTeacher, setDisableTeacher] = useState<boolean>(true);
    const [disableButton, setDisableButton] = useState<boolean>(true);

    useEffect(() => {
        async function getCategories() {

            if(!token) return;
            
            const { data: categoriesData } = await api.getCategories(token);
            setCategoriesData(categoriesData.categories);
            
        }
        getCategories();
    },[])
    
    function handleTextFieldChange(e: any) {
        setTextFieldData({ ...textFieldData, [e.target.name]: e.target.value})
    }

    const handleCategoryChange = (event: SelectChangeEvent) => {
        setCategory(event.target.value as string);
        setDisableDiscipline(false)
    };

    const handleDisciplineChange = (event: SelectChangeEvent) => {
        setDiscipline(event.target.value as string);
        setDisableTeacher(false)
    };

    const handleTeacherChange = (event: SelectChangeEvent) => {
        setTeacher(event.target.value as string);
    };
    
    async function handleCategoryClick(categoryId: number) {
        if(!token) return
        
        const { data: disciplinesData } = await api.getDisciplines(token);
        setDisciplinesData(disciplinesData.disciplines);
        setCategoryId(categoryId)
    }

    async function handleDisciplineClick(disciplineId: number) {
        if(!token) return

        const { data: teachersData } = await api.getTeachersByDisciplineId(token, disciplineId);
        setAllTeachersData(teachersData.teachers)
    }

    async function handleTeacherClick(teacherDisciplineId: number) {
        if(!token) return

        setTestData({
            name: textFieldData.name,
            pdfUrl: textFieldData.pdfUrl,
            categoryId,
            teacherDisciplineId
        })
        setDisableButton(false)
    }

    async function handleSubmit(){
        if(!token || !testData) return

        if (textFieldData.name === '' || textFieldData.pdfUrl === '') {
            setMessage({ type: "error", text: "Todos os campos são obrigatórios!" });
            return;
        }

        await api.insertTest(token, testData);
        setMessage({ type: "success", text: "Prova enviada com sucesso!" })
        navigate('/app/disciplinas')
    }


    return (
        <>
        <Box component="div" sx={{width: "500px", display: "flex", flexDirection: "column",
                                alignItems: "center", gap: "20px", m: "auto"}}>
            <Box component="h2" >Adicione uma prova</Box>
                <TextField sx={{width: 500}}
                    required
                    name="name"
                    id="outlined-required"
                    label="Nome da prova"
                    value={textFieldData.name}
                    onChange={handleTextFieldChange}
                />
                <TextField sx={{ width: 500 }}
                    required
                    name="pdfUrl"
                    id="outlined-required"
                    label="Link da prova"
                    value={textFieldData.pdfUrl}
                    onChange={handleTextFieldChange}
                />
                <FormControl fullWidth>
                    <InputLabel id="category-label">Categoria</InputLabel>
                    <Select
                        labelId="category-label"
                        id="category-select"
                        value={category} 
                        label="category"
                        onChange={handleCategoryChange} 
                    >
                        {categoriesData?.map((category) => 
                            <MenuItem key={category.id} value={category.id} onClick={() => handleCategoryClick(category.id)}>{category.name}</MenuItem>
                        )}

                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="category-label">Disciplina</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={discipline}
                        label="discipline"
                        disabled={disableDiscipline}
                        onChange={handleDisciplineChange}
                        >
                        {disciplinesData?.map((discipline) => 
                            <MenuItem key={discipline.id} value={discipline.id} onClick={() => handleDisciplineClick(discipline.id)}>{discipline.name}</MenuItem>
                        )}

                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="category-label">Instrutor</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={teacher} 
                        label="teacher"
                        disabled={disableTeacher}
                        onChange={handleTeacherChange}
                    >
                        {allTeachersData?.map((t) =>
                            <MenuItem key={t.teacher.id} value={t.teacher.id} onClick={() => handleTeacherClick(t.id)}>{t.teacher.name}</MenuItem>
                        )}
                    </Select>
                </FormControl>
                
                <Button fullWidth disabled={disableButton} variant="contained" sx={{mb: "50px"}} onClick={handleSubmit}>Enviar</Button>
        </Box>
        </>
    )
}

export default AddTest;