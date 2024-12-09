import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import api from '../service/api';
import { Picker } from '@react-native-picker/picker';

function traduzirStatusProjeto(numero) {
  switch (numero) {
    case 0:
      return 'Não Iniciado';
    case 1:
      return 'Em Andamento';
    case 2:
      return 'Finalizado';
    default:
      return 'Desconhecido';
  }
}

export default function HomePage({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: null,
    nome: '',
    descricao: '',
    status: 0,
    dataInicio: '',
    dataFim: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchProjects = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/Projetos?page=${page}&pageSize=${pageSize}`);
      const projectList = response.data.items?.$values || [];
      setProjects(projectList.map((project, index) => ({ ...project, key: String(index) })));
    } catch (error) {
      console.error('Erro ao buscar projetos:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar os projetos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSaveProject = async () => {
    if (!form.nome.trim() || !form.descricao.trim()) {
      Alert.alert('Erro', 'Os campos Nome e Descrição são obrigatórios.');
      return;
    }

    // Verificando se as datas estão corretas
    if (form.dataInicio && !/^\d{4}-\d{2}-\d{2}$/.test(form.dataInicio)) {
      Alert.alert('Erro', 'Data de Início inválida. Formato esperado: YYYY-MM-DD');
      return;
    }

    if (form.dataFim && !/^\d{4}-\d{2}-\d{2}$/.test(form.dataFim)) {
      Alert.alert('Erro', 'Data de Fim inválida. Formato esperado: YYYY-MM-DD');
      return;
    }

    // Certificando-se de que o status seja um número válido
    const status = form.status === 0 || form.status === 1 || form.status === 2 ? form.status : 0;

    const novoProjeto = {
      id: form.id || 0,
      nome: form.nome,
      descricao: form.descricao,
      status: status,
      dataInicio: form.dataInicio ? `${form.dataInicio}T00:00:00Z` : null,
      dataFim: form.dataFim ? `${form.dataFim}T00:00:00Z` : null,
    };

    try {
      if (form.id) {
        await api.put(`/api/Projetos/${form.id}`, novoProjeto);
        Alert.alert('Sucesso', 'Projeto editado com sucesso!');
      } else {
        await api.post('/api/Projetos', novoProjeto);
        Alert.alert('Sucesso', 'Projeto adicionado com sucesso!');
      }
      fetchProjects();
      handleCancel();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível salvar o projeto.');
    }
  };

  const handleDeleteProject = async (projetoId) => {
    try {
      await api.delete(`/api/Projetos/${projetoId}`);
      Alert.alert('Sucesso', 'Projeto excluído com sucesso!');
      fetchProjects();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível excluir o projeto.');
    }
  };

  const handleEditProject = (project) => {
    setForm({
      id: project.id,
      nome: project.nome,
      descricao: project.descricao,
      status: project.status,
      dataInicio: project.dataInicio?.split('T')[0] || '',
      dataFim: project.dataFim?.split('T')[0] || '',
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setForm({ id: null, nome: '', descricao: '', status: 0, dataInicio: '', dataFim: '' });
    setShowAddForm(false);
  };

  const renderProjectItem = ({ item }) => (
    <View style={styles.projectItem}>
      <TouchableOpacity onPress={() => navigation.navigate('ProjetoPage', { projectId: item.id })}>
        <Text style={styles.projectTitle}>{item.nome}</Text>
      </TouchableOpacity>
      <Text>{item.descricao}</Text>
      <Text>Status: {traduzirStatusProjeto(item.status)}</Text>
      <View style={styles.projectButtons}>
        <Button title="Editar" onPress={() => handleEditProject(item)} color="#007BFF" />
        <Button title="Excluir" onPress={() => handleDeleteProject(item.id)} color="red" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Seus Projetos</Text>
      {loading ? (
        <Text style={styles.loadingText}>Carregando projetos...</Text>
      ) : projects.length > 0 ? (
        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          style={styles.list}
        />
      ) : (
        <Text style={styles.noProjectsText}>Nenhum projeto encontrado.</Text>
      )}
      {!showAddForm && <Button title="Novo Projeto" onPress={() => setShowAddForm(true)} color="#28a745" />}
      {showAddForm && (
        <View style={styles.addContainer}>
          <Text style={styles.addTitle}>{form.id ? 'Editar Projeto' : 'Adicionar Novo Projeto'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do projeto"
            value={form.nome}
            onChangeText={(text) => setForm({ ...form, nome: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição do projeto"
            value={form.descricao}
            onChangeText={(text) => setForm({ ...form, descricao: text })}
          />
          <Text style={styles.label}>Status:</Text>
          <Picker
            selectedValue={form.status}
            onValueChange={(value) => setForm({ ...form, status: value })}
            style={styles.picker}
          >
            <Picker.Item label="Não Iniciado" value={0} />
            <Picker.Item label="Em andamento" value={1} />
            <Picker.Item label="Finalizado" value={2} />
          </Picker>
          <TextInput
            style={styles.input}
            placeholder="Data de Início (YYYY-MM-DD)"
            value={form.dataInicio}
            onChangeText={(text) => setForm({ ...form, dataInicio: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Data de Fim (YYYY-MM-DD)"
            value={form.dataFim}
            onChangeText={(text) => setForm({ ...form, dataFim: text })}
          />
          <Button title="Salvar" onPress={handleSaveProject} color="#007BFF" />
          <Button title="Cancelar" onPress={handleCancel} color="gray" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f4f8' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  list: { marginBottom: 10 },
  projectItem: { padding: 20, borderWidth: 1, marginBottom: 15, borderRadius: 10, backgroundColor: '#fff' },
  projectTitle: { fontWeight: 'bold', fontSize: 20, color: '#007BFF' },
  projectButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  addContainer: { padding: 20, borderWidth: 1, borderRadius: 10, backgroundColor: '#fff' },
  addTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#28a745' },
  input: { borderWidth: 1, padding: 12, marginBottom: 10, borderRadius: 5, backgroundColor: '#f1f1f1' },
  label: { fontWeight: 'bold', marginBottom: 5 },
  picker: { height: 50, borderWidth: 1, borderRadius: 5, marginBottom: 15, backgroundColor: '#f1f1f1' },
  noProjectsText: { fontSize: 18, color: '#999', textAlign: 'center', marginTop: 20 },
  loadingText: { textAlign: 'center', fontSize: 18, color: '#999' },
});
