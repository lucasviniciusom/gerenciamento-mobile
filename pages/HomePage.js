import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import api from '../services/api';

export default function HomePage({ navigation }) {
    const [projects, setProjects] = useState([]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects'); // Rota para listar projetos
            setProjects(response.data);
        } catch (error) {
            console.error('Erro ao buscar projetos:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Seus Projetos</Text>
            <FlatList
                data={projects}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <Button
                        title={item.name}
                        onPress={() => navigation.navigate('ProjetoPage', { projectId: item.id })}
                    />
                )}
            />
            <Button title="Adicionar Projeto" onPress={() => {/* lógica para adicionar projeto */}} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, marginBottom: 20 },
});
