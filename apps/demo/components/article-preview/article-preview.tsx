import { createBones } from "bones/react";
import styles from "./styles.module.css";

interface Article {
  title: string;
  excerpt: string;
  author: string;
  date: string;
}

export function ArticlePreview({ article }: { article?: Article | Promise<Article> }) {
  const { bone, data, lines } = createBones(article);

  return (
    <div className={styles.articlePreview}>
      <h3 className={styles.articleTitle} {...bone("text", { length: 24 })}>
        {data?.title}
      </h3>
      {lines(data?.excerpt, 4, (item) => (
        <p className={styles.articleExcerpt}>{item}</p>
      ))}
      <div className={styles.articleMeta}>
        <span {...bone("text", { length: 12 })}>{data?.author}</span>
        <span className={styles.articleDot}>&middot;</span>
        <span {...bone("text", { length: 10 })}>{data?.date}</span>
      </div>
    </div>
  );
}
