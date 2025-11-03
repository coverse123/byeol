// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

// Mostrar/Ocultar modales
function showView(view) {
  document.getElementById('loginView').style.display = view === 'login' ? 'block' : 'none';
  document.getElementById('registerView').style.display = view === 'register' ? 'block' : 'none';
}

// Mostrar vista principal del modal (con botones sociales)
function showAuthModal() {
  document.getElementById('authModal').style.display = 'flex';
  document.getElementById('loginView').style.display = 'none';
  document.getElementById('registerView').style.display = 'none';
}

// Mostrar vista de login (email/password)
function showLoginView() {
  document.getElementById('authModal').style.display = 'flex';
  document.getElementById('loginView').style.display = 'block';
  document.getElementById('registerView').style.display = 'none';
}

// Mostrar vista de registro
function showRegisterView() {
  document.getElementById('authModal').style.display = 'flex';
  document.getElementById('loginView').style.display = 'none';
  document.getElementById('registerView').style.display = 'block';
}

// Iniciar sesión con Google
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(alert);
}
// =============== CARGAR PERFIL ===============
async function loadUserProfile() {
  if (!currentUser) return;

  const doc = await db.collection('users').doc(currentUser.uid).get();
  if (doc.exists) {
    const data = doc.data();
    document.getElementById('userGreeting').textContent = `Hola, ${data.name} (${data.role})`;
    
    // Mostrar formulario de publicación solo si es artista
    document.getElementById('postForm').style.display = data.role === 'artist' ? 'block' : 'none';
  }
}

// =============== FUNCIONES EXISTENTES (sin cambios) ===============
function logout() {
  auth.signOut();
}

function loadArtists() {
  const list = document.getElementById('artistList');
  list.innerHTML = '';
  db.collection('users').where('role', '==', 'artist').get().then(snapshot => {
    snapshot.forEach(doc => {
      const li = document.createElement('li');
      li.textContent = doc.data().name;
      list.appendChild(li);
    });
  });
}

function createPost() {
  const content = document.getElementById('postContent').value.trim();
  if (!content) return;

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
  const feed = document.getElementById('feed');
  feed.innerHTML = '<h2>Publicaciones</h2>';
  db.collection('posts').orderBy('createdAt', 'desc').get().then(snapshot => {
    snapshot.forEach(async (doc) => {
      const post = doc.data();
      const userDoc = await db.collection('users').doc(post.authorId).get();
      if (!userDoc.exists) return;

      const user = userDoc.data();
      const postEl = document.createElement('div');
      postEl.className = 'post-card';
      postEl.innerHTML = `
        <div class="post-header">
          <strong class="post-author">${user.name}</strong>
          ${post.authorId === currentUser.uid ? '(tú)' : ''}
        </div>
        <p>${post.content}</p>
      `;
      feed.appendChild(postEl);
    });
  });
}
