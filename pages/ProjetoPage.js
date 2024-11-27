import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

export default function ProjetoPage({ route }) {
  const { id } = route.params;
  const tasks = [{ id: '1', title: 'Tarefa 1' }, { id: '2', title: 'Tarefa 2' }];

  const handleAddTask = () => {
    // Lógica para adicionar uma nova tarefa
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Projeto {id}</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.task}>{item.title}</Text>}
      />
      <Button title="Adicionar Tarefa" onPress={handleAddTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  task: {
    fontSize: 18,
    marginBottom: 10,
  },
});
