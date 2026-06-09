import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL =  __DEV__
    ? 'http://192.168.100.89:3000'
    : 'https://lyrica-backend.onrender.com';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


//Add auth token to request if user is logged in
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('auth-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

//AI endpoint: GET lyric suggestion
export const getLyricSuggestion = async (lyrics, genre, mood, suggestionType = 'line') => {
    try {
        const response = await api.post('/api/ai/suggest-lyrics', {
            lyrics,
            genre,
            mood,
            suggestionType
        });
        return response.data;
    } catch (error) {
        console.error('AI suggestion error:', error);
        return { 
            success: false, 
            suggestion: "Tuwekeze nguvu, tunaelekea mbali",
            error: error.message
        };
    }
};

//AI endpoint: Get instrument recommendations
export const getInstrumentRecommendations = async (genre, mood, lyrics) => {
    try {
        const response = await api.post('/api/ai/recommend-instruments', {
            genre,
            mood,
            lyrics
        });
        return response.data;
    } catch (error) {
        console.error('Instrument recommendation error:', error);
        return {
            success: false,
            key: 'C major',
            instruments: ['Acoustic guitar', 'Piano', 'Drums']
        };
    }
};

//Auth endpoints 
export const signUp = async (email, password, username) => {
    try {
        const response = await api.post('/api/auth/signup', { email, password, username });
        if (response.data.success) {
            await AsyncStorage.setItem('auth_token', response.data.session?.access_token || '');
        }
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
};

export const signIn = async (email, password) => {
    try {
        const response = await api.post('/api/auth/signin', { email, password });
        if (response.data.success) {
            await AsyncStorage.setItem('auth_token', response.data.session?.access_token || '');
        }
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
};

export const signOut = async () => {
    await AsyncStorage.removeItem('auth_token');
    try {
        return await api.post('/api/auth/signout');
    } catch (error) {
        return { success: false };
    }
};

export default api;