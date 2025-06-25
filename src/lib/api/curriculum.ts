import apiClient from './client';

export const fetchSubjects = async (): Promise<string[]> => {
    const response = await apiClient.get('/curriculum/subjects');
    return response.data;
};

export const fetchGrades = async (subject: string): Promise<string[]> => {
    const response = await apiClient.get(`/curriculum/grades/${subject}`);
    return response.data;
};

export const fetchChapters = async (subject: string, grade: string): Promise<string[]> => {
    const response = await apiClient.get(`/curriculum/chapters/${subject}/${grade}`);
    return response.data;
};

export const fetchTopics = async (subject: string, grade: string, chapter: string): Promise<string[]> => {
    const response = await apiClient.get(`/curriculum/topics/${subject}/${grade}/${chapter}`);
    return response.data;
};