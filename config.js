import * as firebase from 'firebase';
require ('@firebase/firestore');

var firebaseConfig = {
  apiKey: "AIzaSyCOy_BNMdCAU6qNLDcgRN7FwAlepMXGD8Y",
  authDomain: "wily-742a9.firebaseapp.com",
  projectId: "wily-742a9",
  storageBucket: "wily-742a9.appspot.com",
  messagingSenderId: "545365591549",
  appId: "1:545365591549:web:049cd9eb530c9976ab8594"
};
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();






  