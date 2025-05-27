import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          // Verificar si el documento existe antes de crearlo
          const docSnapshot = await getDoc(userDocRef);
          if (!docSnapshot.exists()) {
            await setDoc(userDocRef, {
              email: currentUser.email,
              plan: 'free',
              status: 'active',
              expirationDate: null,
            });
            setMembership({
              email: currentUser.email,
              plan: 'free',
              status: 'active',
              expirationDate: null,
            });
          }

          // Escuchar cambios en los datos de membresía
          const unsubscribeFirestore = onSnapshot(
            userDocRef,
            (snapshot) => {
              if (snapshot.exists()) {
                setMembership(snapshot.data());
              } else {
                console.warn('Documento de usuario no encontrado después de crearlo');
              }
            },
            (error) => {
              console.error('Error al escuchar datos de membresía:', error);
              toast.error('Error al cargar datos de membresía. Verifica tu conexión.');
            }
          );
          return () => unsubscribeFirestore();
        } catch (error) {
          console.error('Error al inicializar datos de usuario:', error);
          toast.error('Error al cargar datos de usuario: ' + error.message);
        }
      } else {
        setMembership(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      setUser(newUser);

      // Crear documento de usuario con plan gratuito
      await setDoc(doc(db, 'users', newUser.uid), {
        email,
        plan: 'free',
        status: 'active',
        expirationDate: null,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setMembership(null);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, logOut, membership, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}