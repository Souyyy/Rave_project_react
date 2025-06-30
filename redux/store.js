import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'


// importation des reducers des slices
import serveur from './slices/serveurSlice'
import enregistrement from './slices/enregistrementSlice'


// config pour garder des trucs apres fermeture de lapp
const configPersist = {
  key: 'racine',
  storage: AsyncStorage,
  whitelist: ['serveur', 'enregistrement'],
}

// on combine tout les trucs redux ici
const reducteurPrincipal = combineReducers({
  serveur,
  enregistrement,
})

// ont combine redux persist avec le reducteur
const reducteurAvecPersist = persistReducer(configPersist, reducteurPrincipal)

// le store contient toutes les donnes
export const store = configureStore({
  reducer: reducteurAvecPersist,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// pour garder les donnes a la fermeture de lapp
export const persistor = persistStore(store);
