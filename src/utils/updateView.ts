import api from "../services/api";

export async function updateView(testId: number) {
    await api.updateTestView(testId);
}