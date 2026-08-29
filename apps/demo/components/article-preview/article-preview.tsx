import type { ComponentProps } from "react";
import styles from "./styles.module.css";

interface Article {
  title: string;
  excerpt: string;
  author: string;
  date: string;
}

export function ArticlePreview({
  article,
  ...rest
}: { article?: Article } & ComponentProps<"div">) {
  return (
    <div className={styles.articlePreview} {...rest}>
      <h3 className={styles.articleTitle}>{article?.title}</h3>
      <p className={styles.articleExcerpt} data-bones-lines="4">
        {article?.excerpt}
      </p>
      <div className={styles.articleMeta}>
        <span>{article?.author}</span>
        <span className={styles.articleDot} data-bones-auto="off">
          &middot;
        </span>
        <span>{article?.date}</span>
      </div>
    </div>
  );
}
