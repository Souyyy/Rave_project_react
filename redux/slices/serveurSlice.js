import { createSlice } from '@reduxjs/toolkit'

const etatInitial = {
  ip: '',
  port: '',
  connecte: false,
}

const serveurSlice = createSlice({
  name: 'serveur',
  initialState: etatInitial,
  reducers: {
    changerInfosServeur: (etat, action) => {
      etat.ip = action.payload.ip
      etat.port = action.payload.port
    },
    changerConnexion: (etat, action) => {
      etat.connecte = action.payload
    },
  },
})

export const { changerInfosServeur, changerConnexion } = serveurSlice.actions
export default serveurSlice.reducer