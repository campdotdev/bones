import { ArticlePreview } from "@/components/article-preview/article-preview";
import { DemoSection } from "@/components/demo-section/demo-section";
import styles from "./styles.module.css";

export function MultiLineTextDemo() {
  return (
    <DemoSection
      title="Multi-Line Text"
      description={
        <>
          Put <code>data-bones-lines</code> on a paragraph and the stylesheet paints that many bars
          in the one element, with a shorter last line.
        </>
      }
    >
      <div className={styles.articleDemos}>
        <ArticlePreview aria-busy="true" />
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
