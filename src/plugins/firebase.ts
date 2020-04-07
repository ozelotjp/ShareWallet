import { Plugin } from '@nuxt/types'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'

const firebaseConfig = {
  apiKey: 'AIzaSyAnPxhPM3zVG2OKj_vXCfmYt3fVRJPEVRY',
  authDomain: 'sharew-366a1.firebaseapp.com',
  databaseURL: 'https://sharew-366a1.firebaseio.com',
  projectId: 'sharew-366a1',
  storageBucket: 'sharew-366a1.appspot.com',
  messagingSenderId: '94243407825',
  appId: '1:94243407825:web:11c5a8747602f471e842f0'
}
firebase.initializeApp(firebaseConfig)

const myPlugin: Plugin = (_, inject) => {
  inject('firebase', firebase)
}

export default myPlugin
