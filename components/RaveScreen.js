import React, { useState } from 'react'
import { View, Text, Pressable, FlatList, StyleSheet, Alert, ActivityIndicator, ToastAndroid, Platform } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import * as FileSystem from 'expo-file-system'
import { Audio } from 'expo-av'
import { useSelector } from 'react-redux'

export default function ScreenRave() {
    // UseSelector pour recuperer des informations de serveur et de la liste des enregistrements via Redux
    const { ip, port } = useSelector(e => e.serveur)
    const enregistrements = useSelector(e => e.enregistrement.liste)

    // Déclaration des états
    const [modeleChoisi, definirModele] = useState('Jazz')
    const [sonChoisi, definirSon] = useState(null)
    const [cheminTransforme, definirCheminTransforme] = useState(null)
    const [chargement, definirChargement] = useState(false)
    const [sonOriginal, definirSonOriginal] = useState(null)
    const [sonTransforme, definirSonTransforme] = useState(null)

    const adresseServeur = ip && port ? `http://${ip}:${port}` : null

    // petit message qui saffiche selon le device
    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Info', message);
        }
    };

    // Fonction qui envoie le son au serveur pour traitement
    const envoieSon = async () => {
        // verifier si une adresse serveur et presente
        if (!adresseServeur) {
            showToast('Veuillez configurer un serveur avant de continuer.')
            return
        }

        // verifier si un fichier audio existe
        const info = await FileSystem.getInfoAsync(sonChoisi.uri)
        if (!info.exists) {
            showToast("Le fichier audio sélectionné n'existe plus.")
            return
        }

        // verifier si un fichier audio et selectionner
        if (!sonChoisi || !sonChoisi.uri) {
            showToast('Veuillez sélectionner un clip avant de continuer.')
            return
        }

        // verifier si un modele et choisi
        if (!modeleChoisi) {
            showToast('Veuillez sélectionner un modèle.')
            return
        }

        try {
            //Afficher le loader
            definirChargement(true)

            // Requete pour selectionner le modele sur le serveur
            const reponseModele = await fetch(`${adresseServeur}/selectModel/${modeleChoisi}`)
            if (!reponseModele.ok) throw new Error(`Erreur sélection modèle : ${reponseModele.status}`)

            //on cree un formulaire avec ntre fichier audio
            const formulaire = new FormData()
            formulaire.append('file', {
                uri: sonChoisi.uri,
                name: sonChoisi.nom || 'audio.m4a',
                type: 'audio/m4a',
            })

            //Envoie du formulaire
            const reponseEnvoi = await fetch(`${adresseServeur}/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formulaire,
            })
            if (!reponseEnvoi.ok) throw new Error(`Erreur envoi clip : ${reponseEnvoi.status}`)


            // Téléchargement du son transformé depuis le serveur    
            const reponseTelechargement = await fetch(`${adresseServeur}/download`)
            if (!reponseTelechargement.ok) throw new Error(`Erreur téléchargement : ${reponseTelechargement.status}`)

            const blob = await reponseTelechargement.blob()
            const nomFichier = `transforme_${Date.now()}.wav`
            const dossier = `${FileSystem.documentDirectory}transformes/`

            // on crée le dossier si nécessaire
            const infoDossier = await FileSystem.getInfoAsync(dossier)
            if (!infoDossier.exists) {
                await FileSystem.makeDirectoryAsync(dossier, { intermediates: true })
            }

            const cheminFichier = dossier + nomFichier

            // Conversion du blob en base64 
            const base64 = await new Promise((res, rej) => {
                const lecteur = new FileReader()
                lecteur.onloadend = () => res(lecteur.result.split(',')[1])
                lecteur.onerror = rej
                lecteur.readAsDataURL(blob)
            })

            await FileSystem.writeAsStringAsync(cheminFichier, base64, {
                encoding: FileSystem.EncodingType.Base64,
            })

            definirCheminTransforme(cheminFichier)
            showToast('Le son transformé est prêt à être écouté.')
        } catch (erreur) {
            console.error(erreur)
            showToast(erreur.message)
        } finally {
            definirChargement(false)
        }
    }

    // Fonction qui lit un son depuis un URI
    const jouerSon = async (uri, estTransforme = false) => {
        try {
            const son = new Audio.Sound()
            // Charge le fichier audio + joue le son
            await son.loadAsync({ uri })
            await son.playAsync()

            if (estTransforme) {
                if (sonTransforme) await sonTransforme.unloadAsync()
                definirSonTransforme(son)
                // Nettoyage quand le son se termine
                son.setOnPlaybackStatusUpdate((etat) => {
                    if (!etat.isPlaying) son.unloadAsync() && definirSonTransforme(null)
                })
            } else {
                if (sonOriginal) await sonOriginal.unloadAsync()
                definirSonOriginal(son)
                son.setOnPlaybackStatusUpdate((etat) => {
                    if (!etat.isPlaying) son.unloadAsync() && definirSonOriginal(null)
                })
            }
        } catch (erreur) {
            console.error(erreur)
            Alert.alert('Erreur lecture', erreur.message)
        }
    }

    // Affiche chaque son audio dans une liste
    const afficherElement = ({ item }) => (
        <Pressable
            style={[styles.element, sonChoisi?.uri === item.uri && styles.selectionne]}
            onPress={() => definirSon(item)}
        >
            <Text style={styles.nomClip}>{item.nom}</Text>
        </Pressable>
    )

    return (
        <View style={styles.conteneur}>
            <Text style={styles.titre}>🎧 Transfert de Timbre</Text>

            <Text style={styles.etape}>1. Choisissez un modèle</Text>
            <Picker selectedValue={modeleChoisi} onValueChange={definirModele} style={styles.selecteur}>
                <Picker.Item label="Jazz" value="Jazz" />
                <Picker.Item label="Parole" value="Parole" />
                <Picker.Item label="Chats" value="Chats" />
                <Picker.Item label="Chiens" value="Chiens" />
                <Picker.Item label="Darbouka" value="Darbouka" />
            </Picker>

            <Text style={styles.etape}>2. Sélectionnez un enregistrement</Text>
            <FlatList
                data={enregistrements}
                keyExtractor={e => e.uri}
                renderItem={afficherElement}
                style={styles.liste}
            />

            <Pressable
                style={[styles.bouton, (!sonChoisi || chargement) && styles.boutonDesactive]}
                onPress={envoieSon}
                disabled={!sonChoisi || chargement}
            >
                {chargement ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.texteBouton}>Envoyer au serveur</Text>
                )}
            </Pressable>

            {sonChoisi && (
                <Pressable style={styles.lecteur} onPress={() => jouerSon(sonChoisi.uri)}>
                    <Text>▶️ Écouter original</Text>
                </Pressable>
            )}

            {cheminTransforme && (
                <Pressable style={styles.lecteur} onPress={() => jouerSon(cheminTransforme, true)}>
                    <Text>🎶 Écouter transformé</Text>
                </Pressable>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    conteneur: {
        flex: 1,
        padding: 20,
        marginTop: 50
    },
    titre: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333'
    },
    etape: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 5,
        color: '#555'
    },
    selecteur: {
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 15
    },
    liste: {
        maxHeight: 150,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5
    },
    element: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff'
    },
    selectionne: {
        backgroundColor: '#d9f9d9'
    },
    nomClip: {
        fontSize: 15
    },
    bouton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 10,
    },
    boutonDesactive: {
        backgroundColor: '#a5d6a7',
    },
    texteBouton: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    lecteur: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 5,
    },
})
