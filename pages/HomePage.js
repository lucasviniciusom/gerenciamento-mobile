import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

export default function HomePage({ navigation }) {
  const projects = [{ id: '1', title: 'Projeto 1' }, { id: '2', title: 'Projeto 2' }];

  const handleAddProject = () => {
    // Lógica para adicionar um novo projeto
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seus Projetos</Text>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Button title={item.title} onPress={() => navigation.navigate('ProjetoPage', { id: item.id })} />
        )}
      />
      <Button title="Adicionar Projeto" onPress={handleAddProject} />
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
});
