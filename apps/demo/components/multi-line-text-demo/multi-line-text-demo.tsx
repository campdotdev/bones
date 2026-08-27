import { forceBones } from "@camp.dev/bones/react";
import { ArticlePreview } from "@/components/article-preview/article-preview";
import { DemoSection } from "@/components/demo-section/demo-section";
import styles from "./styles.module.css";

export function MultiLineTextDemo() {
  return (
    <DemoSection
      title="Multi-Line Text"
      description={
        <>
          Use the <code>lines()</code> helper to create paragraph-sized placeholders. Each skeleton
          line is a real element with its own animation.
        </>
      }
    >
      <div className={styles.articleDemos}>
        <ArticlePreview article={forceBones} />
        <ArticlePreview
          article={{
            title: "Understanding React Server Components",
            excerpt:
              "Server Components let you render components on the server, reducing the JavaScript sent to the client. This changes how we think about data fetching and component architecture.",
            author: "Dan Abramov",
            date: "Mar 2026",
          }}
        />
      </div>
    </DemoSection>
  );
}
