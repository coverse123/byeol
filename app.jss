// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

// UI
const authModal = document.getElementById('authModal');
const app = document.getElementById('app');
const feed = document.getElementById('feed');
const postForm = document.getElementById('postForm');
const artistList = document.getElementById('artistList');

// Observar estado de autenticación
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    authModal.style.display = 'none';
    app.style.display = 'block';
    
    // Ver rol desde Firestore
    db.collection('users').doc(user.uid).get().then(doc => {
      if (doc.exists) {
        const role = doc.data().role;
        if (role === 'artist') {
          postForm.style.display = 'block';
        }
      }
    });

    loadArtists();
    loadPosts();
  } else {
    authModal.style.display = 'flex';
    app.style.display = 'none';
  }
});

function toggleAuthMode() {
  const modal = document.querySelector('.modal-content');
  const p = modal.querySelector('p');
  if (p.innerHTML.includes('Registrar')) {
    p.innerHTML = '¿Ya tienes cuenta? <a href="#" onclick="toggleAuthMode()">Inicia sesión</a>';
  } else {
    p.innerHTML = '¿No tienes cuenta? <a href="#" onclick="toggleAuthMode()">Regístrate</a>';
  }
}

function registerUser() {
  const name = document.getElementById('displayName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('userRole').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return db.collection('users').doc(userCredential.user.uid).set({
        name,
        email,
        role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .catch(alert);
}

function logout() {
  auth.signOut();
}

function loadArtists() {
  artistList.innerHTML = '';
  db.collection('users').where('role', '==', 'artist').get().then(snapshot => {
    snapshot.forEach(doc => {
      const li = document.createElement('li');
      li.textContent = doc.data().name;
      artistList.appendChild(li);
    });
  });
}

function createPost() {
  const content = document.getElementById('postContent').value;
  if (!content.trim()) return;

  db.collection('posts').add({
    content,
    authorId: currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById('postContent').value = '';
    loadPosts();
  });
}

function loadPosts() {
  feed.innerHTML = '<h2>Publicaciones</h2>';
  db.collection('posts')
    .orderBy('createdAt', 'desc')
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const post = doc.data();
        db.collection('users').doc(post.authorId).get().then(userDoc => {
          const user = userDoc.data();
          const postEl = document.createElement('div');
          postEl.className = 'post-card';
          postEl.innerHTML = `
            <div class="post-header">
              <strong class="post-author">${user.name}</strong>
              <span>${post.authorId === currentUser.uid ? '(tú)' : ''}</span>
            </div>
            <p>${post.content}</p>
            <button class="like-btn" onclick="toggleLike('${doc.id}')">🤍 Me gusta</button>
          `;
          feed.appendChild(postEl);
        });
      });
    });
}

function toggleLike(postId) {
  alert("Función de 'me gusta' simulada. Para guardar likes, se necesita más lógica.");
}
