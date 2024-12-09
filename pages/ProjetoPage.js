import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import api from '../service/api';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const translateTaskStatus = (status) => {
  return ['Não Iniciada', 'Em Andamento', 'Finalizada'][status] || 'Desconhecida';
};

const translateTaskPriority = (priority) => {
  return ['Baixa', 'Média', 'Alta'][priority] || 'Desconhecida';
};

export default function ProjetoPage({ route }) {
  const { projectId } = route.params;
  const [tasks, setTasks] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [taskForm, setTaskForm] = useState({
    id: null,
    titulo: '',
    descricao: '',
    prioridade: 0,
    status: 0,
    dataVencimento: Platform.OS === 'web' ? '' : null,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchTasks();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/Projetos/${projectId}`);
      setProjectName(response.data.nome || 'Projeto Desconhecido');
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      Alert.alert('Erro', 'Não foi possível carregar o projeto.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/Tarefas/Projeto/${projectId}`);
      if (response.data && response.data.$values && response.data.$values.length > 0) {
        setTasks(response.data.$values);
      } else {
        setTasks([]); // Caso não haja tarefas
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
      setTasks([]);  // Garantir que o estado seja limpo se falhar
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!taskForm.titulo.trim() || !taskForm.descricao.trim()) {
      Alert.alert('Erro', 'Título e Descrição são obrigatórios.');
      return false;
    }
    if (![0, 1, 2].includes(taskForm.prioridade)) {
      Alert.alert('Erro', 'Prioridade inválida.');
      return false;
    }
    if (![0, 1, 2].includes(taskForm.status)) {
      Alert.alert('Erro', 'Status inválido.');
      return false;
    }
    if (Platform.OS === 'web' && !/^\d{4}-\d{2}-\d{2}$/.test(taskForm.dataVencimento)) {
      Alert.alert('Erro', 'Data de vencimento inválida.');
      return false;
    }
    return true;
  };

  const saveTask = async () => {
    if (!validateForm()) return;

    let formattedDate = taskForm.dataVencimento;
    if (taskForm.dataVencimento) {
      // Se a plataforma for web, garantir que a data esteja no formato correto
      if (Platform.OS === 'web' && /^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
        formattedDate = `${formattedDate}T00:00:00Z`;
      } else if (formattedDate instanceof Date) {
        formattedDate = formattedDate.toISOString();
      }
    }

    const payload = {
      id: taskForm.id || 0, // Certifique-se de que 'id' seja válido
      titulo: taskForm.titulo.trim(),
      descricao: taskForm.descricao.trim(),
      prioridade: taskForm.prioridade,
      status: taskForm.status,
      dataVencimento: formattedDate || null,  // Garantir que o campo 'dataVencimento' não seja vazio
      projetoId: projectId, // Associando a tarefa ao projeto correto
    };

    try {
      if (taskForm.id) {
        // Editar tarefa existente
        await api.put(`/api/Tarefas/Projeto/${projectId}/${taskForm.id}`, payload);
        Alert.alert('Sucesso', 'Tarefa editada com sucesso!');
      } else {
        // Criar nova tarefa
        await api.post(`/api/Tarefas/Projeto/${projectId}`, payload);
        Alert.alert('Sucesso', 'Tarefa criada com sucesso!');
      }
      fetchTasks();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível salvar a tarefa.');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/api/Tarefas/Projeto/${projectId}/${taskId}`);
      Alert.alert('Sucesso', 'Tarefa removida com sucesso!');
      fetchTasks(); // Recarregar as tarefas após a exclusão
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível remover a tarefa.');
    }
  };

  const resetForm = () => {
    setTaskForm({
      id: null,
      titulo: '',
      descricao: '',
      prioridade: 0,
      status: 0,
      dataVencimento: Platform.OS === 'web' ? '' : null,
    });
    setIsEditing(false);
  };

  const handleEdit = (task) => {
    setTaskForm({
      id: task.id,
      titulo: task.titulo,
      descricao: task.descricao,
      prioridade: task.prioridade,
      status: task.status,
      dataVencimento:
        Platform.OS === 'web'
          ? task.dataVencimento.split('T')[0]
          : new Date(task.dataVencimento),
    });
    setIsEditing(true);
  };

  const renderTask = ({ item }) => (
    <View style={styles.task}>
      <Text style={styles.taskTitle}>{item.titulo}</Text>
      <Text>{item.descricao}</Text>
      <Text>Prioridade: {translateTaskPriority(item.prioridade)}</Text>
      <Text>Status: {translateTaskStatus(item.status)}</Text>
      <Text>Vencimento: {item.dataVencimento ? new Date(item.dataVencimento).toLocaleDateString() : 'Data não definida'}</Text>
      <Button title="Editar" onPress={() => handleEdit(item)} />
      <Button title="Excluir" color="red" onPress={() => deleteTask(item.id)} />
    </View>
  );

  const handleNewTask = () => {
    resetForm();  // Resetar o formulário para criar uma nova tarefa
    setIsEditing(true);  // Garantir que o formulário de edição seja exibido
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefas do Projeto</Text>
      <Text style={styles.projectName}>{projectName || 'Nome do Projeto Não Disponível'}</Text> {/* Verificação adicional */}
      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTask}
        />
      )}
      <Button title="Nova Tarefa" onPress={handleNewTask} />
      {isEditing && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Título"
            value={taskForm.titulo}
            onChangeText={(text) => setTaskForm({ ...taskForm, titulo: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição"
            value={taskForm.descricao}
            onChangeText={(text) => setTaskForm({ ...taskForm, descricao: text })}
          />
          <Text style={styles.label}>Prioridade:</Text>
          <Picker
            selectedValue={taskForm.prioridade}
            onValueChange={(value) => setTaskForm({ ...taskForm, prioridade: value })}
            style={styles.picker}
          >
            <Picker.Item label="Baixa" value={0} />
            <Picker.Item label="Média" value={1} />
            <Picker.Item label="Alta" value={2} />
          </Picker>

          <Text style={styles.label}>Status:</Text>
          <Picker
            selectedValue={taskForm.status}
            onValueChange={(value) => setTaskForm({ ...taskForm, status: value })}
            style={styles.picker}
          >
            <Picker.Item label="Não Iniciada" value={0} />
            <Picker.Item label="Em Andamento" value={1} />
            <Picker.Item label="Finalizada" value={2} />
          </Picker>

          {Platform.OS === 'web' ? (
            <TextInput
              style={styles.input}
              placeholder="Data de Vencimento (YYYY-MM-DD)"
              value={taskForm.dataVencimento}
              onChangeText={(text) => setTaskForm({ ...taskForm, dataVencimento: text })}
            />
          ) : (
            <DateTimePicker
              value={taskForm.dataVencimento || new Date()}
              mode="date"
              display="default"
              onChange={(e, date) =>
                setTaskForm({ ...taskForm, dataVencimento: date })
              }
            />
          )}
          <Button title="Salvar" onPress={saveTask} />
          <Button title="Cancelar" color="gray" onPress={() => setIsEditing(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#f0f0f0' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  projectName: { fontSize: 20, fontWeight: 'bold', color: '#007BFF', marginBottom: 20 },
  task: { padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5, backgroundColor: '#fff' },
  taskTitle: { fontWeight: 'bold', fontSize: 18 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 5, backgroundColor: '#f1f1f1' },
  form: { padding: 10, borderWidth: 1, marginTop: 20 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  picker: { height: 50, borderWidth: 1, borderRadius: 5, marginBottom: 15, backgroundColor: '#f1f1f1' },
});
