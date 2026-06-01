import { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ImageBackground,
    SectionList,
    TouchableOpacity
} from 'react-native';

import { formatarData } from '../utils/DateFormat';
import DiaCard from '../componentes/DiaCard';
import { supabase } from '../utils/supabase';

export default function HomeScreen({ route, navigation }) {

    const usuario = route.params?.usuario;

    const [jogos, setJogos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregarJogos() {
            setLoading(true);

            const { data, error } = await supabase
                .from('jogos')
                .select('*')
                .order('data_brasilia', { ascending: true });

            if (error) {
                console.log('Erro ao buscar jogos:', error);
                setJogos([]);
            } else {
                setJogos(data ?? []);
            }

            setLoading(false);
        }

        carregarJogos();
    }, []);

    useEffect(() => {
        async function carregarFavoritos() {
            if (!usuario) return;

            const { data, error } = await supabase
                .from('favoritos')
                .select('id_jogo')
                .eq('id_usuario', usuario.id);

            if (!error) {
                setFavoritos(data.map(item => item.id_jogo));
            }
        }

        carregarFavoritos();
    }, [usuario]);

    /*useEffect(() => {

        async function inserirUsuario() {

            const { data, error } = await supabase
                .from('usuarios')
                .insert([
                    {
                        nome: 'Taffe',
                        ra: '00000000',
                        email: 'test@test.com.br',
                        senha: '123456',
                        telefone: '11999999999',
                        data_nascimento: '2000-01-01',
                    }
                ])
            if (!error) {
                console.log('Usuario inserido com sucesso')
            } else {
                console.log('Erro ao inserir usuario', error)
            }

        }
        inserirUsuario();

    }, [])*/

    const [favoritos, setFavoritos] = useState([]);
    const [grupoSelecionado, setGrupoSelecionado] = useState('TODOS');




    const grupos = [
        'TODOS',
        ...new Set(jogos.map(jogo => jogo.grupo))
    ];

    const toggleFavorito = async (idJogo) => {
        /*console.log('Clicou no jogo:', idJogo);
        console.log('Usuário logado:', usuario);*/

        if (!usuario) {
            alert('Usuário não encontrado');
            return;
        }

        if (favoritos.includes(idJogo)) {
            const { error } = await supabase
                .from('favoritos')
                .delete()
                .eq('id_usuario', usuario.id)
                .eq('id_jogo', idJogo);

            if (error) {
                console.log('Erro ao remover favorito:', error);
                alert('Erro ao remover favorito');
                return;
            }

            setFavoritos(favoritos.filter(item => item !== idJogo));
        } else {
            const { error } = await supabase
                .from('favoritos')
                .insert([
                    {
                        id_usuario: usuario.id,
                        id_jogo: idJogo
                    }
                ]);

            if (error) {
                //console.log('Erro ao salvar favorito:', error);
                alert('Erro ao salvar favorito');
                return;
            }

            setFavoritos([...favoritos, idJogo]);
        }
    };

    const jogosFiltrados =
        grupoSelecionado === 'TODOS'
            ? jogos
            : jogos.filter(jogo => jogo.grupo === grupoSelecionado);

    const agruparPorData = (jogos) => {
        return jogos.reduce((acc, jogo) => {

            const data = formatarData(jogo.data_brasilia);

            if (!acc[data]) acc[data] = [];

            acc[data].push(jogo);

            acc[data].sort((a, b) =>
                a.hora_brasilia.localeCompare(b.hora_brasilia)
            );

            return acc;
        }, {});
    };

    const jogosAgrupados = agruparPorData(jogosFiltrados ?? []);

    const jogosTratados = Object.keys(jogosAgrupados).map(data => ({
        title: data,
        data: jogosAgrupados[data]



    }));

    const SemJogos = () => (
        <View style={{
            marginTop: 30,
            padding: 20,
            backgroundColor: '#0c1b2a',
            borderRadius: 12,
            alignItems: 'center'
        }}>
            <Text style={{
                color: '#f2cc2f',
                fontSize: 16,
                fontWeight: 'bold'
            }}>
                Nenhum jogo carregado
            </Text>
        </View>
    );

    return (
        <ImageBackground
            source={require('../assets/bg-overlay.png')}
            style={styles.container}
            resizeMode="cover"
        >

            <View style={styles.content}>

                <Image
                    style={styles.logo}
                    source={require('../assets/unicopa.png')}
                />

                <Text style={styles.title}>
                    CALENDÁRIO
                </Text>
                <View style={styles.botoesMenu}>
                    <TouchableOpacity
                        style={styles.botaoPalpites}
                        onPress={() =>
                            navigation.navigate('Palpites', {
                                usuario
                            })
                        }
                    >
                        <Text style={styles.textoBotaoPalpites}>
                            Cadastrar Palpites
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.botaoPalpites}
                        onPress={() =>
                            navigation.navigate('MeusPalpites', {
                                usuario
                            })
                        }
                    >
                        <Text style={styles.textoBotaoPalpites}>
                            Meus Palpites
                        </Text>
                    </TouchableOpacity>
                </View>



                <View style={styles.filtrosContainer}>

                    {grupos.map((grupo) => (
                        <TouchableOpacity
                            key={grupo}
                            style={[
                                styles.botaoGrupo,
                                grupoSelecionado === grupo && styles.botaoGrupoAtivo
                            ]}
                            onPress={() => setGrupoSelecionado(grupo)}
                        >
                            <Text
                                style={[
                                    styles.textoGrupo,
                                    grupoSelecionado === grupo && styles.textoGrupoAtivo
                                ]}
                            >
                                {grupo}
                            </Text>
                        </TouchableOpacity>
                    ))}

                </View>


                {loading ? (
                    <Text style={{ color: 'white', marginTop: 20 }}>
                        Carregando jogos...
                    </Text>
                ) : jogos.length === 0 ? (
                    <SemJogos />
                ) : (
                    <SectionList
                        style={{ width: '100%' }}
                        contentContainerStyle={{
                            alignItems: 'center',
                            paddingBottom: 40
                        }}
                        sections={jogosTratados}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={() => null}
                        renderSectionHeader={({ section }) => (
                            <DiaCard
                                data={section.title}
                                jogos={section.data}
                                favoritos={favoritos}
                                toggleFavorito={toggleFavorito}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

        </ImageBackground>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#040b13',
    },

    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
    },

    logo: {
        width: 200,
        height: 50,
        resizeMode: 'contain'
    },

    title: {
        marginTop: 10,
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
    },

    filtrosContainer: {
        marginTop: 20,
        marginBottom: 10,
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 10
    },

    botaoGrupo: {
        backgroundColor: '#102030',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1e2d3d',
        margin: 4
    },

    botaoGrupoAtivo: {
        backgroundColor: '#f2cc2f',
    },

    textoGrupo: {
        color: 'white',
        fontWeight: 'bold'
    },

    textoGrupoAtivo: {
        color: '#040b13'
    },
    botaoPalpites: {
        backgroundColor: '#f2cc2f',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 15,
    },

    textoBotaoPalpites: {
        color: '#040b13',
        fontWeight: 'bold',
    },
    botoesMenu: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 15,
    },

});