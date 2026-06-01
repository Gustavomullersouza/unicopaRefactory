import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

import { supabase } from '../utils/supabase';

export default function PalpitesScreen({ route, navigation }) {
  const usuario = route?.params?.usuario;

  const [jogos, setJogos] = useState([]);
  const [palpites, setPalpites] = useState({});

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const { data: jogosData, error: jogosError } = await supabase
      .from('jogos')
      .select('*')
      .order('data_brasilia', { ascending: true });

    if (jogosError) {
      Alert.alert('Erro', 'Não foi possível carregar os jogos.');
      return;
    }

    setJogos(jogosData || []);

    if (!usuario) return;

    const { data: palpitesData, error: palpitesError } = await supabase
      .from('palpites')
      .select('*')
      .eq('id_usuario', usuario.id);

    if (palpitesError) {
      console.log('Erro ao carregar palpites:', palpitesError);
      return;
    }

    const mapa = {};

    (palpitesData || []).forEach((palpite) => {
      mapa[palpite.id_jogo] = {
        placar_time_casa: String(palpite.placar_time_casa),
        placar_time_fora: String(palpite.placar_time_fora),
        situacao: palpite.situacao,
        confirmado: palpite.confirmado,
      };
    });

    setPalpites(mapa);
  }

  function jogoIniciado(jogo) {
    const dataHoraJogo = new Date(`${jogo.data_brasilia}T${jogo.hora_brasilia}`);
    const agora = new Date();

    return agora >= dataHoraJogo;
  }

  function alterarPalpite(idJogo, campo, valor) {
    setPalpites({
      ...palpites,
      [idJogo]: {
        ...palpites[idJogo],
        [campo]: valor,
      },
    });
  }

  async function salvarPalpite(jogo) {
    if (!usuario) {
      Alert.alert('Erro', 'Usuário não encontrado.');
      return;
    }

    const palpite = palpites[jogo.id];

    if (jogoIniciado(jogo) || palpite?.confirmado) {
      Alert.alert('Bloqueado', 'Este palpite não pode mais ser editado.');
      return;
    }

    if (
      !palpite ||
      palpite.placar_time_casa === undefined ||
      palpite.placar_time_fora === undefined ||
      palpite.placar_time_casa === '' ||
      palpite.placar_time_fora === ''
    ) {
      Alert.alert('Erro', 'Informe os dois placares.');
      return;
    }

    const dadosPalpite = {
      id_usuario: usuario.id,
      id_jogo: jogo.id,
      placar_time_casa: Number(palpite.placar_time_casa),
      placar_time_fora: Number(palpite.placar_time_fora),
      situacao: 'PENDENTE',
      confirmado: false,
    };

    const { error } = await supabase
      .from('palpites')
      .upsert(dadosPalpite, {
        onConflict: 'id_usuario,id_jogo',
      });

    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }

    Alert.alert('Sucesso', 'Palpite salvo com sucesso.');
    carregarDados();
  }

  async function confirmarPalpite(jogo) {
  if (!usuario) {
    Alert.alert('Erro', 'Usuário não encontrado.');
    return;
  }

  const palpite = palpites[jogo.id];

  if (
    !palpite ||
    palpite.placar_time_casa === undefined ||
    palpite.placar_time_fora === undefined ||
    palpite.placar_time_casa === '' ||
    palpite.placar_time_fora === ''
  ) {
    Alert.alert('Erro', 'Informe os dois placares antes de confirmar.');
    return;
  }

  const dadosPalpite = {
    id_usuario: usuario.id,
    id_jogo: jogo.id,
    placar_time_casa: Number(palpite.placar_time_casa),
    placar_time_fora: Number(palpite.placar_time_fora),
    situacao: 'PENDENTE',
    confirmado: true,
  };

  const { error } = await supabase
    .from('palpites')
    .upsert(dadosPalpite, {
      onConflict: 'id_usuario,id_jogo',
    });

  if (error) {
    Alert.alert('Erro', error.message);
    return;
  }

  Alert.alert('Sucesso', 'Palpite confirmado com sucesso.');
  carregarDados();
}

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Meus Palpites</Text>

      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoBotaoVoltar}>Voltar</Text>
      </TouchableOpacity>

      {jogos.map((jogo) => {
        const palpite = palpites[jogo.id] || {};
        const bloqueado = jogoIniciado(jogo) || palpite.confirmado;

        return (
          <View key={jogo.id} style={styles.card}>
            <Text style={styles.confronto}>{jogo.confronto}</Text>

            <Text style={styles.info}>
              {jogo.data_brasilia} • {jogo.hora_brasilia}
            </Text>

            {palpite.confirmado && (
              <Text style={styles.confirmado}>
                ✓ Palpite confirmado
              </Text>
            )}

            <View style={styles.linhaPalpite}>
              <Text style={styles.time}>{jogo.sigla_casa}</Text>

              <TextInput
                style={[
                  styles.input,
                  bloqueado && styles.inputBloqueado,
                ]}
                keyboardType="numeric"
                editable={!bloqueado}
                value={palpite.placar_time_casa || ''}
                onChangeText={(valor) =>
                  alterarPalpite(jogo.id, 'placar_time_casa', valor)
                }
              />

              <Text style={styles.x}>x</Text>

              <TextInput
                style={[
                  styles.input,
                  bloqueado && styles.inputBloqueado,
                ]}
                keyboardType="numeric"
                editable={!bloqueado}
                value={palpite.placar_time_fora || ''}
                onChangeText={(valor) =>
                  alterarPalpite(jogo.id, 'placar_time_fora', valor)
                }
              />

              <Text style={styles.time}>{jogo.sigla_fora}</Text>
            </View>

            {jogoIniciado(jogo) ? (
              <Text style={styles.bloqueado}>
                Jogo iniciado — edição bloqueada
              </Text>
            ) : palpite.confirmado ? (
              <Text style={styles.bloqueado}>
                Palpite enviado — edição bloqueada
              </Text>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.botaoSalvar}
                  onPress={() => salvarPalpite(jogo)}
                >
                  <Text style={styles.textoBotao}>
                    Salvar palpite
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoConfirmar}
                  onPress={() => confirmarPalpite(jogo)}
                >
                  <Text style={styles.textoBotaoConfirmar}>
                    Confirmar palpite
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );
      })}
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

  card: {
    backgroundColor: '#0c1b2a',
    borderRadius: 12,
    padding: 15,
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
    marginBottom: 10,
  },

  confirmado: {
    color: '#36d399',
    fontWeight: 'bold',
    marginBottom: 10,
  },

  linhaPalpite: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  time: {
    color: 'white',
    fontWeight: 'bold',
  },

  input: {
    backgroundColor: 'white',
    width: 50,
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
  },

  inputBloqueado: {
    backgroundColor: '#c8c8c8',
  },

  x: {
    color: 'white',
    fontWeight: 'bold',
  },

  botaoSalvar: {
    backgroundColor: '#f2cc2f',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },

  botaoConfirmar: {
    backgroundColor: '#36d399',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  textoBotao: {
    color: '#040b13',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  textoBotaoConfirmar: {
    color: '#040b13',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  bloqueado: {
    color: '#ff6b6b',
    marginTop: 12,
    fontWeight: 'bold',
  },
});