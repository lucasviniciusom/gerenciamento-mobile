import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; 

const api = axios.create({
  baseURL: 'https://localhost:44374/', // URL base do backend rodando no localhost
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  async (config) => {
    let token;

    try {
      // Verifica o ambiente e obtém o token
      if (typeof window !== 'undefined') {
        // Ambiente Web
        token = localStorage.getItem('token');
        console.log('Token obtido do localStorage:', token);
      } else {
        // Ambiente Mobile
        token = await SecureStore.getItemAsync('token');
        console.log('Token obtido do SecureStore:', token);
      }

      // Adiciona o token ao cabeçalho da requisição, se disponível
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erro ao obter o token:', error);
    }

    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

export default api;
