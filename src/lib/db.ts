import { db } from "./firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc,
  deleteDoc,
  serverTimestamp,
  increment
} from "firebase/firestore";

// TIPOS DE DATOS
export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  photoURL: string;
  bio: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  role?: "owner" | "mod" | "user";
}

// ------------------------------
// GESTIÓN DE PERFIL DE USUARIO
// ------------------------------

export async function getUserProfile(userId: string) {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as UserProfile : null;
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  // Aseguramos que desde el cliente no puedan enviarse campos protegidos
  const { isVerified, followersCount, followingCount, ...safeData } = data as any;
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    ...safeData,
    updatedAt: serverTimestamp()
  });
}

// ------------------------------
// SISTEMA DE SEGUIDORES (FOLLOW)
// ------------------------------

export async function toggleFollowUser(currentUserId: string, targetUserId: string, isFollowing: boolean) {
  const followerRef = doc(db, `users/${targetUserId}/followers/${currentUserId}`);
  const followingRef = doc(db, `users/${currentUserId}/following/${targetUserId}`);
  
  const targetUserRef = doc(db, "users", targetUserId);
  const currentUserRef = doc(db, "users", currentUserId);

  if (isFollowing) {
    // Unfollow
    await deleteDoc(followerRef);
    await deleteDoc(followingRef);
    await updateDoc(targetUserRef, { followersCount: increment(-1) });
    await updateDoc(currentUserRef, { followingCount: increment(-1) });
  } else {
    // Follow
    await setDoc(followerRef, { followedAt: serverTimestamp() });
    await setDoc(followingRef, { followedAt: serverTimestamp() });
    await updateDoc(targetUserRef, { followersCount: increment(1) });
    await updateDoc(currentUserRef, { followingCount: increment(1) });
  }
}

// ------------------------------
// PUBLICACIONES (LIKES & COMENTARIOS)
// ------------------------------

export async function toggleLikePost(postId: string, userId: string, isLiked: boolean) {
  const likeRef = doc(db, `posts/${postId}/likes/${userId}`);
  const postRef = doc(db, "posts", postId);

  if (isLiked) {
    await deleteDoc(likeRef);
    await updateDoc(postRef, { likesCount: increment(-1) });
  } else {
    await setDoc(likeRef, { likedAt: serverTimestamp() });
    await updateDoc(postRef, { likesCount: increment(1) });
  }
}

export async function addComment(postId: string, userId: string, text: string) {
  const commentsRef = collection(db, `posts/${postId}/comments`);
  await addDoc(commentsRef, {
    authorId: userId,
    text,
    createdAt: serverTimestamp()
  });
  
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, { commentsCount: increment(1) });
}
