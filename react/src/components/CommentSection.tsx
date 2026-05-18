import React, { useState } from 'react';
import type { StrapiComment, StrapiUser } from '../types/strapi';
import styles from './CommentSection.module.css';

interface Props {
  photoId: string;
  initialComments: StrapiComment[];
  user?: StrapiUser | null;
}

export default function CommentSection({ photoId, initialComments, user }: Props) {
  const [comments, setComments] = useState<StrapiComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isModerator = user?.role?.type === 'editor' || user?.role?.type === 'admin';

  const handleSubmit = async (content: string, parentId?: number) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const parentDocId = parentId ? comments.find(c => c.id === parentId)?.documentId : undefined;
      
      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId,
          content,
          parentId: parentDocId
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to post comment');
      }

      let newCommentObj: StrapiComment = data.data;

      if (user && (!newCommentObj.author || typeof newCommentObj.author === 'string' || typeof newCommentObj.author === 'number')) {
        newCommentObj = {
          ...newCommentObj,
          author: user
        };
      }
      
      if (parentId) {
        setComments(prev => prev.map(c => {
          if (c.id === parentId) {
            return { ...c, reply: newCommentObj };
          }
          return c;
        }));
        setReplyTo(null);
        setReplyContent('');
      } else {
        setComments(prev => [newCommentObj, ...prev]);
        setNewComment('');
      }

      const audio = new Audio('/crunch.mp3');
      audio.play().catch(() => {});

      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await fetch(`/api/comment/${commentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete comment');
      }

      // Remove from state immediately
      setComments(prev => {
        const newComments = prev.filter(c => c.id !== commentId);
        // Also check if it was a reply to another comment
        return newComments.map(c => {
          if (c.reply?.id === commentId) {
            const { reply, ...rest } = c;
            return rest as StrapiComment;
          }
          return c;
        });
      });

    } catch (err: any) {
      alert(err.message);
    }
  };

  const rootComments = comments.filter(c => !c.parent);

  return (
    <section className={styles['comment-section']}>
      <h2>Comments ({comments.length})</h2>

      {user ? (
        <div className={styles['comment-form']}>
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={500}
          />
          {error && <p className={styles['error-message']}>{error}</p>}
          <button
            className={styles['submit-btn']}
            onClick={() => handleSubmit(newComment)}
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      ) : (
        <div className={styles['login-prompt']}>
          <p>Please <a href="/login" className={styles['login-link']}>log in</a> to join the conversation.</p>
        </div>
      )}

      <div className={styles['comment-list']}>
        {rootComments.map(comment => (
          <div key={comment.id} className={styles['comment-item']}>
            <div className={styles['comment-main']}>
              <div className={styles['comment-avatar']}>
                {comment.author?.username?.[0].toUpperCase() || '?'}
              </div>
              <div className={styles['comment-content-wrapper']}>
                <a href={`/artist/${comment.author?.username}`} className={styles['comment-author']}>
                  {comment.author?.username}
                </a>
                <p className={styles['comment-text']}>{comment.content}</p>
              </div>
            </div>
            
            <div className={styles['comment-actions']}>
              <span className={styles['comment-date']}>
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
              {user && !comment.reply && (
                <button 
                  className={styles['action-btn']}
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                >
                  Reply
                </button>
              )}
              {isModerator && (
                <button 
                  className={`${styles['action-btn']} ${styles['delete-btn']}`}
                  onClick={() => handleDelete(comment.id)}
                >
                  Delete
                </button>
              )}
            </div>

            {comment.reply && (
              <div className={styles['reply-list']}>
                <div className={styles['comment-item']}>
                  <div className={styles['comment-main']}>
                    <div className={`${styles['comment-avatar']} ${styles['comment-avatar-small']}`}>
                      {comment.reply.author?.username?.[0].toUpperCase() || '?'}
                    </div>
                    <div className={styles['comment-content-wrapper']}>
                      <a href={`/artist/${comment.reply.author?.username}`} className={styles['comment-author']}>
                        {comment.reply.author?.username}
                      </a>
                      <p className={styles['comment-text']}>{comment.reply.content}</p>
                    </div>
                  </div>
                  <div className={`${styles['comment-actions']} ${styles['comment-actions-reply']}`}>
                    <span className={`${styles['comment-date']} ${styles['comment-date-small']}`}>
                      {new Date(comment.reply.createdAt).toLocaleDateString()}
                    </span>
                    {isModerator && (
                      <button 
                        className={`${styles['action-btn']} ${styles['delete-btn']}`}
                        onClick={() => handleDelete(comment.reply!.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {replyTo === comment.id && (
              <div className={styles['reply-form-wrapper']}>
                <textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  maxLength={500}
                  autoFocus
                />
                <div className={styles['reply-form-actions']}>
                  <button className={styles['cancel-btn']} onClick={() => setReplyTo(null)}>Cancel</button>
                  <button
                    className={`${styles['submit-btn']} ${styles['submit-btn-small']}`}
                    onClick={() => handleSubmit(replyContent, comment.id)}
                    disabled={isSubmitting || !replyContent.trim()}
                  >
                    {isSubmitting ? 'Replying...' : 'Reply'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {rootComments.length === 0 && (
          <p className={styles['no-comments']}>
            No comments yet. Be the first to munch on this art!
          </p>
        )}
      </div>
    </section>
  );
}
