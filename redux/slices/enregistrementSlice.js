import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  liste: [],
}

const enregistrementSlice = createSlice({
  name: 'enregistrement',
  initialState,
  reducers: {
    ajouterEnregistrement(state, action) {
      state.liste.push(action.payload)
    },
    supprimerEnregistrement(state, action) {
      state.liste = state.liste.filter(e => e.uri !== action.payload)
    },
    // (optionnel) vider la liste
    viderListe(state) {
      state.liste = []
    },
  },
})

export const { ajouterEnregistrement, supprimerEnregistrement, viderListe } = enregistrementSlice.actions
export default enregistrementSlice.reducer