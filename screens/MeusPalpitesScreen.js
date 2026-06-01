import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { supabase } from '../utils/supabase';

export default function MeusPalpitesScreen({ route, navigation }) {
  const usuario = route?.params?.usuario;

  const [palpites, setPalpites] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');

  useEffect(() => {
    carregarPalpites();
  }, []);

  async function carregarPalpites() {
    if (!usuario) return;

    const { data, error } = await supabase
      .from('palpites')
      .select(`
        *,
        jogos (
          id,
          confronto,
          data_brasilia,
          hora_brasilia,
          sigla_casa,
          sigla_fora,
          estadio,
          cidade,
          pais
        )
      `)
      .eq('id_usuario', usuario.id)
      .order('data_criacao', { ascending: false });

    if (!error) {
      setPalpites(data || []);
    }
  }

  const palpitesFiltrados = palpites.filter((palpite) => {
    if (filtro === 'TODOS') return true;
    if (filtro === 'PENDENTES') return !palpite.confirmado;
    if (filtro === 'CONFIRMADOS') return palpite.confirmado;
    return true;
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Meus Palpites</Text>

      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoBotaoVoltar}>Voltar</Text>
      </TouchableOpacity>

      <View style={styles.filtros}>
        {['TODOS', 'PENDENTES', 'CONFIRMADOS'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.botaoFiltro,
              filtro === item && styles.botaoFiltroAtivo,
            ]}
            onPress={() => setFiltro(item)}
          >
            <Text
              style={[
                styles.textoFiltro,
                filtro === item && styles.textoFiltroAtivo,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {palpitesFiltrados.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.textoVazio}>
            Você ainda não cadastrou palpites
          </Text>
        </View>
      ) : (
        palpitesFiltrados.map((palpite) => (
          <View key={palpite.id} style={styles.card}>
            <Text style={styles.confronto}>
              {palpite.jogos?.confronto}
            </Text>

            <Text style={styles.info}>
              {palpite.jogos?.data_brasilia} • {palpite.jogos?.hora_brasilia}
            </Text>

            <Text style={styles.placar}>
              {palpite.jogos?.sigla_casa} {palpite.placar_time_casa}
              {' x '}
              {palpite.placar_time_fora} {palpite.jogos?.sigla_fora}
            </Text>

            <Text style={styles.status}>
              Status: {palpite.confirmado ? 'CONFIRMADO' : 'PENDENTE'}
            </Text>

            <Text style={styles.situacao}>
              Situação: {palpite.situacao}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040b13',
    padding: 20,
  },

  titulo: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },

  botaoVoltar: {
    backgroundColor: '#102030',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  textoBotaoVoltar: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  filtros: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },

  botaoFiltro: {
    backgroundColor: '#102030',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },

  botaoFiltroAtivo: {
    backgroundColor: '#f2cc2f',
  },

  textoFiltro: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },

  textoFiltroAtivo: {
    color: '#040b13',
  },

  vazio: {
    backgroundColor: '#0c1b2a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },

  textoVazio: {
    color: '#f2cc2f',
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#0c1b2a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  confronto: {
    color: '#f2cc2f',
    fontSize: 16,
    fontWeight: 'bold',
  },

  info: {
    color: '#8fa3b8',
    marginTop: 5,
  },

  placar: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },

  status: {
    color: '#36d399',
    marginTop: 10,
    fontWeight: 'bold',
  },

  situacao: {
    color: '#8fa3b8',
    marginTop: 5,
  },
});