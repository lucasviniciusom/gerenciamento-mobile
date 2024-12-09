import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // Armazenamento seguro
import api from '../service/api'; // Serviço de API

export default function LoginPage({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log('Tentativa de login com:', { email, password });

    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Enviando a requisição de login para a API
      const response = await api.post('/api/Usuarios/login', {
        email,
        senha: password, 
      });

      console.log('Resposta da API:', response.data);

      const { token } = response.data;
      console.log('Token recebido:', token);

      // Verifica o ambiente e armazena o token
      if (typeof window !== 'undefined') {
        // Ambiente Web
        localStorage.setItem('token', token);
        console.log('Token armazenado no localStorage (Web).');
      } else {
        // Ambiente Mobile
        await SecureStore.setItemAsync('token', token);
        console.log('Token armazenado no SecureStore (Mobile).');
      }

      // Redireciona para a HomePage
      navigation.navigate('HomePage');
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message);

      const errorMessage =
        error.response?.data?.message || 'Erro ao tentar fazer login.';
      Alert.alert('Erro', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#4A90E2', // Cor de acento para o título
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    fontSize: 16,
  },
});
