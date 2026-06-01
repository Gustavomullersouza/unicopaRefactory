import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';

import { supabase } from '../utils/supabase';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    async function fazerLogin() {
        if (!email || !senha) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('senha', senha)
            .single();

        if (error || !data) {
            Alert.alert('Erro', 'E-mail ou senha inválidos');
            return;
        }

        navigation.replace('Home', {
            usuario: data
        });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>UniCopa</Text>

            <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#999"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
            />

            <TouchableOpacity
                style={styles.botao}
                onPress={fazerLogin}
            >
                <Text style={styles.textoBotao}>
                    Entrar
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
            >
                <Text style={styles.link}>
                    Criar conta
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#040b13',
        justifyContent: 'center',
        padding: 30,
    },

    titulo: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
    },

    input: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },

    botao: {
        backgroundColor: '#f2cc2f',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },

    textoBotao: {
        fontWeight: 'bold',
    },

    link: {
        color: '#f2cc2f',
        textAlign: 'center',
        marginTop: 20,
    },
});