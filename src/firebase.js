import firebase from 'firebase'

const config = {
    apiKey: "AIzaSyCX2yaS5DuhmUQLFD_5EN6S4-7zH_nv5Os",
    authDomain: "srn-site.firebaseapp.com",
    databaseURL: "https://srn-site.firebaseio.com",
    projectId: "srn-site",
    storageBucket: "srn-site.appspot.com",
    messagingSenderId: "517502367209"
};
firebase.initializeApp(config);
export default firebase;
