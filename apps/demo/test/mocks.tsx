import type { ReactNode } from "react";

const mockForceBones = Object.freeze({});

export function bonesMockFactory() {
  return {
    forceBones: mockForceBones,
    createBones: <T,>(data: T) => ({
      bone: () => ({}),
      data: data === mockForceBones ? undefined : (data ?? undefined),
      repeat: <U,>(
        arr: U[] | undefined,
        count: number,
        render: (item: U | undefined, index: number) => ReactNode,
      ): ReactNode[] => {
        const items: (U | undefined)[] = arr ?? Array.from({ length: count }, () => undefined);
        return items.map((item, i) => render(item, i));
      },
      lines: <V,>(
        value: V | null | undefined,
        _count: number,
        render: (item: V) => ReactNode,
      ): ReactNode[] => {
        if (value == null) return [];
        return [render(value)];
      },
    }),
  };
}

export function bonesWithDataMockFactory() {
  return {
    forceBones: mockForceBones,
    createBones: <T,>(data: T) => ({
      bone: () => ({}),
      data: data === mockForceBones ? undefined : (data ?? undefined),
      repeat: <U,>(
        arr: U[] | undefined,
        count: number,
        render: (item: U | undefined, index: number) => ReactNode,
      ): ReactNode[] => {
        const items: (U | undefined)[] = arr ?? Array.from({ length: count }, () => undefined);
        return items.map((item, i) => render(item, i));
      },
      lines: <V,>(
        value: V | null | undefined,
        _count: number,
        render: (item: V) => ReactNode,
      ): ReactNode[] => {
        if (value == null) return [];
        return [render(value)];
      },
    }),
  };
}

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
