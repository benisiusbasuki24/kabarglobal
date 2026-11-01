import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CommentItem } from '../types';

export const SAMPLE_INITIAL_COMMENTS: Record<string, CommentItem[]> = {
  'art-world-01': [
    {
      id: 'comm-1',
      articleId: 'art-world-01',
      userId: 'user-sample-1',
      userName: 'Dr. Surya Wibowo',
      content: 'Langkah $100 miliar ini sangat krusial, terutama bagi negara kepulauan yang langsung terdampak abrasi pesisir. Semoga mekanisme penyalurannya transparan dan cepat!',
      likes: 12,
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
    },
    {
      id: 'comm-2',
      articleId: 'art-world-01',
      userId: 'user-sample-2',
      userName: 'Rina Kusuma',
      content: 'Kemitraan publik dan swasta harus dilibatkan agar proyek energi surya dan angin bisa bersaing harganya dengan energi fosil.',
      likes: 5,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ],
  'art-tech-01': [
    {
      id: 'comm-3',
      articleId: 'art-tech-01',
      userId: 'user-sample-3',
      userName: 'Andi Nugroho (Tech Enthusiast)',
      content: 'Pengurangan daya hingga 40% pada node 2nm ini game-changer sekali untuk on-device LLM. Smartphone tidak akan cepat panas lagi saat running voice assistant cerdas.',
      likes: 19,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ]
};

export class CommentService {
  public static subscribeToArticleComments(
    articleId: string, 
    callback: (comments: CommentItem[]) => void
  ): () => void {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('articleId', '==', articleId));

    return onSnapshot(q, (snapshot) => {
      const items: CommentItem[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          articleId: data.articleId,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          content: data.content,
          likes: data.likes || 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
        });
      });

      // If no comments found in DB yet, supplement with curated sample discussions
      if (items.length === 0 && SAMPLE_INITIAL_COMMENTS[articleId]) {
        callback(SAMPLE_INITIAL_COMMENTS[articleId]);
      } else {
        // Sort newest first
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      }
    }, (error) => {
      console.warn('Comment listener notice:', error);
      // Fallback to sample if network issues
      callback(SAMPLE_INITIAL_COMMENTS[articleId] || []);
    });
  }

  public static async addComment(params: {
    articleId: string;
    userId: string;
    userName: string;
    userEmail?: string;
    content: string;
  }): Promise<void> {
    const commentId = `cm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const commentData = {
      id: commentId,
      articleId: params.articleId,
      userId: params.userId,
      userName: params.userName.slice(0, 100),
      userEmail: params.userEmail || '',
      content: params.content.slice(0, 1000),
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'comments'), commentData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
    }
  }

  public static async likeComment(commentId: string): Promise<void> {
    try {
      const ref = doc(db, 'comments', commentId);
      await updateDoc(ref, {
        likes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `comments/${commentId}`);
    }
  }

  public static async deleteComment(commentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}`);
    }
  }
}
