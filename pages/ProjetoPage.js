import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TextInput } from 'react-native';
import api from '../services/api';

export default function ProjetoPage({ route }) {
    const { projectId } = route.params;
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    const fetchTasks = async () => {
        try {
            const response = await api.get(`/projects/${projectId}/tasks`); // Rota para listar tarefas
            setTasks(response.data);
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
        }
    };

    const handleAddTask = async () => {
        try {
            const response = await api.post(`/projects/${projectId}/tasks`, { name: newTask });
            setTasks([...tasks, response.data]);
            setNewTask('');
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tarefas do Projeto</Text>
            <FlatList
                data={tasks}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => <Text style={styles.task}>{item.name}</Text>}
            />
            <TextInput
                style={styles.input}
                placeholder="Nova Tarefa"
                value={newTask}
                onChangeText={setNewTask}
            />
            <Button title="Adicionar Tarefa" onPress={handleAddTask} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, marginBottom: 20 },
    task: { fontSize: 18, marginBottom: 10 },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});
