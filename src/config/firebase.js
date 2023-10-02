import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const config = {
  apiKey: 'AIzaSyDuRgK1iETwmgH8oDFB8bN_ZA7xCWui2do',
  authDomain: 'vue-school-forum-59b92.firebaseapp.com',
  projectId: 'vue-school-forum-59b92',
  storageBucket: 'vue-school-forum-59b92.appspot.com',
  messagingSenderId: '988699410763',
  appId: '1:988699410763:web:d892add8b7489e33c4a8ce',
  databaseURL: 'https://vue-school-forum-59b92-default-rtdb.europe-west1.firebasedatabase.app/'
}

const app = initializeApp(config)
const db = getFirestore(app)
export default db
