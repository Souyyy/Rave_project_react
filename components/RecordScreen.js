import React, { useState, useEffect } from 'react'
import { View, Text, Pressable, FlatList, StyleSheet, Alert, Platform, Linking, ToastAndroid } from 'react-native'
import * as FileSystem from 'expo-file-system'
import { Audio } from 'expo-av'
import { useDispatch, useSelector } from 'react-redux'
import { ajouterEnregistrement, supprimerEnregistrement } from '../redux/slices/enregistrementSlice'

export default function RecordScreen() {
  const dispatch = useDispatch()
  // UseSelector pour recuperer les enregistrements via Redux
  const enregistrement = useSelector(s => s.enregistrement.liste)

  // Déclaration des états
  const [recording, setRecording] = useState(null)
  const [sound, setSound] = useState(null)
  const [permissionResponse, requestPermission] = Audio.usePermissions()

   // generer un nom unique qui est baser sur l'heure actuelle
  const genererNom = () => `enregistrement_${Date.now()}.m4a`

    // petit message qui saffiche selon le device
    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Info', message);
        }
    };

  // Configuration audio au chargement
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    })
  }, [])

  // Nettoyer les ressources
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync()
      }
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [recording, sound])

  // Fonction pour démarrer l'enregistrement
  const demarrer = async () => {
    try {
      // Vérifier et demander permission
      if (permissionResponse.status !== 'granted') {
        console.log('Demande de permission...')
        const permission = await requestPermission()
        if (permission.status !== 'granted') {
          Alert.alert(
            'Permission refusée',
            'Allez dans les paramètres pour autoriser l\'accès au microphone',
            [
              { text: 'OK' },
              { 
                text: 'Paramètres', 
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:')
                  } else {
                    Linking.openSettings()
                  }
                }
              }
            ]
          )
          return
        }
      }

      console.log('Démarrage enregistrement...')
      
      // Créer et démarrer l'enregistrement
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      setRecording(recording)
      console.log('Enregistrement démarré')
      
    } catch (err) {
      console.error('Erreur démarrage enregistrement', err)
      showToast(`Impossible de démarrer l'enregistrement: ${err.message}`)
    }
  }

   // Fonction pour arreter l'enregistrement et le sauvegarder
  const arreter = async () => {
    if (!recording) return

    try {
      console.log('Arrêt enregistrement...')
      await recording.stopAndUnloadAsync()
      
      const uri = recording.getURI()
      setRecording(null)
      
      if (uri) {
        const nom = genererNom()
        const dest = `${FileSystem.documentDirectory}${nom}`
        
        // Déplacer le fichier
        await FileSystem.moveAsync({ from: uri, to: dest })
        
        // Ajouter à Redux
        dispatch(ajouterEnregistrement({ nom, uri: dest }))
        
        showToast('Enregistrement sauvegardé')
        console.log('Enregistrement sauvé:', dest)
      }
      
    } catch (error) {
      console.error('Erreur arrêt:', error)
      showToast(`Impossible d'arrêter l'enregistrement: ${error.message}`)
    }
  }

  const jouer = async (uri) => {
    try {
      // Arrêter le son précédent
      if (sound) {
        await sound.unloadAsync()
        setSound(null)
      }

      // Vérifier que le fichier existe
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (!fileInfo.exists) {
        showToast('Fichier audio introuvable')
        return
      }

      console.log('Lecture de:', uri)
      
      // Créer et jouer le son
      const { sound: newSound } = await Audio.Sound.createAsync({ uri })
      setSound(newSound)
      
      // Gérer la fin de lecture
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          newSound.unloadAsync()
          setSound(null)
        }
      })
      
      await newSound.playAsync()
      
    } catch (error) {
      console.error('Erreur lecture:', error)
      showToast(`Impossible de lire le fichier: ${error.message}`)
    }
  }

  // Fonction pour supprimer un enregistrement
  const supprimer = async (item) => {
    Alert.alert(
      'Confirmer suppression',
      `Supprimer ${item.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // Arrêter la lecture si nécessaire
              if (sound) {
                await sound.unloadAsync()
                setSound(null)
              }
              
              // Supprimer le fichier
              await FileSystem.deleteAsync(item.uri, { idempotent: true })
              
              // Supprimer de Redux
              dispatch(supprimerEnregistrement(item.uri))
              
            } catch (error) {
              console.error('Erreur suppression:', error)
              showToast('Impossible de supprimer le fichier')
            }
          }
        }
      ]
    )
  }

  const renderItem = ({ item }) => (
    <View style={styles.ligne}>
      <Text style={styles.nom}>{item.nom}</Text>
      <View style={styles.boutons}>
        <Pressable 
          style={styles.boutonAction}
          onPress={() => jouer(item.uri)}
        >
          <Text style={styles.emoji}>▶️</Text>
        </Pressable>
        <Pressable 
          style={styles.boutonAction}
          onPress={() => supprimer(item)}
        >
          <Text style={[styles.emoji, { color: 'red' }]}>🗑️</Text>
        </Pressable>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Enregistrement audio</Text>
      
      {/* Indicateur de permission */}
      <View style={styles.permissionStatus}>
        <Text style={styles.permissionText}>
          Permission micro: {permissionResponse?.status || 'undetermined'}
        </Text>
        {permissionResponse?.status !== 'granted' && (
          <Pressable 
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              Demander permission
            </Text>
          </Pressable>
        )}
      </View>
      
      <Pressable
        style={[
          recording ? styles.boutonStop : styles.boutonStart,
          permissionResponse?.status !== 'granted' && !recording && styles.boutonDisabled
        ]}
        onPress={recording ? arreter : demarrer}
        disabled={permissionResponse?.status !== 'granted' && !recording}
      >
        <Text style={styles.texteBouton}>
          {recording ? '⏹️ Arrêter' : 'Enregistrer'}
        </Text>
      </Pressable>

      <Text style={styles.sousTitre}>
        Mes enregistrements ({enregistrement.length})
      </Text>
      
      {enregistrement.length === 0 ? (
        <View style={styles.vide}>
          <Text style={styles.texteVide}>Aucun enregistrement</Text>
        </View>
      ) : (
        <FlatList
          data={enregistrement}
          keyExtractor={item => item.uri}
          renderItem={renderItem}
          style={styles.liste}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    marginTop: 50,
  },
  titre: { 
    fontSize: 24, 
    fontWeight: 'bold',
    textAlign: 'center', 
    marginBottom: 30,
    color: '#333'
  },
  boutonStart: { 
    backgroundColor: '#4CAF50', 
    padding: 15, 
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boutonStop: { 
    backgroundColor: '#f44336', 
    padding: 15, 
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  texteBouton: { 
    color: '#fff', 
    textAlign: 'center', 
    fontWeight: 'bold',
    fontSize: 16
  },
  sousTitre: { 
    fontSize: 18, 
    fontWeight: '600',
    marginVertical: 15,
    color: '#333'
  },
  ligne: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nom: { 
    fontSize: 16,
    flex: 1,
    color: '#333'
  },
  boutons: { 
    flexDirection: 'row',
    gap: 15
  },
  boutonAction: {
    padding: 5
  },
  emoji: {
    fontSize: 20
  },
  liste: {
    flex: 1
  },
  vide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  texteVide: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic'
  },
  permissionStatus: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center'
  },
  permissionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  boutonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6
  }
})