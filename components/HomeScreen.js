import React, { useState, useEffect } from 'react';
import { Text, TextInput, Pressable, Alert, StyleSheet, SafeAreaView, ToastAndroid, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux'
import { changerInfosServeur, changerConnexion } from '../redux/slices/serveurSlice'


export default function HomeScreen() {
    // Récupérer les infos ip et port depuis Redux
    const infosServeur = useSelector(state => state.serveur);
    // Utilisaiton des states + dispatch
    const [AdresseIp, setAdresseIp] = useState('');
    const [port, setPort] = useState('');
    const dispatch = useDispatch()

    // Mettre a jour localement les states au montage si Redux contient des valeurs
    useEffect(() => {
        if (infosServeur.ip) setAdresseIp(infosServeur.ip);
        if (infosServeur.port) setPort(infosServeur.port);
    }, [infosServeur.ip, infosServeur.port]);

    // petit message qui saffiche selon le device
    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Info', message);
        }
    };

    // fonction pour tester la connexion au serveur
    const testerConnexion = async () => {

        // Verification si un champs et vide
        if (!AdresseIp || !port) {
            showToast('Veuillez remplir tous les champs.');
            return;
        }

        // Verification si le champs port et vraiment un port
        const portNombre = parseInt(port, 10);
        if (isNaN(portNombre) || portNombre < 1 || portNombre > 99999) {
            showToast('Le port doit être entre 1 et 99999.');
            return;
        }

        // Construction de l'url + essaie de connexion au serveur
        const connexion = `http://${AdresseIp}:${port}`;
        try {
            const reponse = await fetch(connexion);

            if (reponse.ok) {
                showToast('Connexion réussie !');

                // on met a jour les infos dans redux
                dispatch(changerInfosServeur({ ip: AdresseIp, port }))
                dispatch(changerConnexion(true))
            } else {
                showToast(`Erreur serveur : ${response.status}`);
            }
        } catch (error) {
            // Si la requête echoue (mauvaise IP, port, pas de connexion...)
            showToast('Erreur réseau : impossible de se connecter.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Connexion au serveur</Text>
            <Text style={styles.soustitle}>Rave Onnx</Text>

            <TextInput
                style={styles.input}
                placeholder="Adresse IP (ex. 192.168.1.10)"
                placeholderTextColor="#aaa"
                value={AdresseIp}
                onChangeText={setAdresseIp}
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                placeholder="Port (ex. 25565)"
                placeholderTextColor="#aaa"
                value={port}
                onChangeText={setPort}
                keyboardType="numeric"
            />

            <Pressable style={styles.button} onPress={testerConnexion}>
                <Text style={styles.buttonText}>Tester la connexion</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        color: '#222',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    soustitle: {
        fontSize: 22,
        color: '#222',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        height: 55,
        backgroundColor: '#eee',
        borderRadius: 12,
        paddingHorizontal: 15,
        color: '000',
        marginBottom: 20,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOpacity: 0.5,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 4
        },
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: '600',
    },
});