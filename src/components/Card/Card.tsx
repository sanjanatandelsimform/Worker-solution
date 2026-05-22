import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  description: string;
  onAction?: () => void;
  actionLabel?: string;
}

const Card: React.FC<CardProps> = ({ title, description, onAction, actionLabel }) => {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {onAction && actionLabel && (
        <footer className={styles.footer}>
          <button
            className={styles.actionButton}
            onClick={onAction}
            aria-label={actionLabel}
          >
            {actionLabel}
          </button>
        </footer>
      )}
    </article>
  );
};

export default Card;
