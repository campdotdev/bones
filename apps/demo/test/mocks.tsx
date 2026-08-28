import type { ReactNode } from "react";

export function nextImageMockFactory() {
  return {
    default: ({
      src,
      alt,
      width,
      height,
      ...props
    }: {
      src: string;
      alt: string;
      width?: number;
      height?: number;
      [key: string]: unknown;
    }) => <img src={src} alt={alt} width={width} height={height} {...props} />,
  };
}

export function nextLinkMockFactory() {
  return {
    default: ({
      children,
      href,
      ...props
    }: {
      children: ReactNode;
      href: string;
      [key: string]: unknown;
    }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  };
}
