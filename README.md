# POLARTRONIC STUDIO — Plataforma de Agencia Digital

## Stack
- **React 18** + Vite
- **Firebase** (Firestore + Auth + Storage)
- **Tailwind CSS**
- **react-router-dom** + **react-hot-toast**

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar Firebase (OBLIGATORIO antes de usar)
# Edita: src/lib/firebase.js
# Reemplaza los valores con los de tu proyecto Firebase

# 3. Lanzar en desarrollo
npm run dev

# 4. Build de producción
npm run build
```

---

## Configurar Firebase (paso a paso)

### 1. Crear proyecto
- Ve a https://console.firebase.google.com
- Crea un nuevo proyecto
- Activa **Google Analytics** (opcional)

### 2. Habilitar Authentication
- Firebase Console → Authentication → Get Started
- Habilita **Email/Password**
- Crea un usuario: Authentication → Users → Add user

### 3. Habilitar Firestore
- Firebase Console → Firestore Database → Create database
- Empieza en **modo producción**
- Aplica estas reglas en Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lectura pública del sitio
    match /site/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /ecosystems/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /projects/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /testimonials/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /services/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Habilitar Storage
- Firebase Console → Storage → Get Started
- Aplica estas reglas:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Obtener credenciales
- Firebase Console → Project Settings (⚙️) → Your apps → Web
- Registra la app → copia el `firebaseConfig`
- Pega en `src/lib/firebase.js`

---

## Estructura del Proyecto

```
src/
├── lib/
│   ├── firebase.js          ← 🔑 TUS CREDENCIALES AQUÍ
│   ├── firebaseHelpers.js   ← CRUD para Firestore + Storage
│   └── useAuth.js           ← Hook de autenticación
├── hooks/
│   └── useSiteData.js       ← Carga todos los datos del sitio
├── pages/
│   ├── PublicSite.jsx       ← Sitio público
│   ├── AdminLogin.jsx       ← Login del panel
│   └── AdminPanel.jsx       ← Panel de control
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.jsx
│   │   ├── AdminHeader.jsx
│   │   ├── ImageUploadField.jsx  ← Sube imágenes a Firebase Storage
│   │   ├── FieldGroup.jsx
│   │   └── tabs/
│   │       ├── SiteConfigTab.jsx     ← Marca, colores, about
│   │       ├── HeroTab.jsx           ← Portada principal
│   │       ├── ServicesTab.jsx       ← Servicios CRUD
│   │       ├── EcosystemsTab.jsx     ← Tarjetas de nicho CRUD
│   │       ├── ProjectsTab.jsx       ← Portfolio CRUD
│   │       ├── TestimonialsTab.jsx   ← Testimonios CRUD
│   │       └── ContactTab.jsx        ← Contacto & Footer
│   └── site/
│       ├── NavBar.jsx
│       ├── Hero.jsx
│       ├── ServicesSection.jsx
│       ├── EcosystemSection.jsx
│       ├── ProjectsSection.jsx
│       ├── TestimonialsSection.jsx
│       ├── ContactSection.jsx
│       └── Footer.jsx
```

---

## Acceso al Panel de Administración

- URL: `http://localhost:5173/admin`
- Usa las credenciales del usuario que creaste en Firebase Auth

---

## Personalización

Todos los cambios se hacen desde `/admin` y se guardan en Firestore:

| Sección            | Qué puedes editar                              |
|-------------------|------------------------------------------------|
| Marca & Colores   | Nombre, tagline, color primario, fondo         |
| Hero              | Badge, titular, subtítulo, CTA, imagen de fondo|
| Servicios         | CRUD completo (emoji, título, desc, precio)    |
| Ecosistemas       | CRUD completo con imagen                       |
| Proyectos         | CRUD completo con imagen y link                |
| Testimonios       | CRUD completo con avatar                       |
| Contacto & Footer | Email, WhatsApp, Instagram, textos legales     |
