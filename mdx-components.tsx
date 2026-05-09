import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mt-2 text-3xl sm:text-4xl">{children}</h1>
    ),
    h2: ({ children }) => <h2 className="mt-8 text-2xl">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-6 text-xl">{children}</h3>,
    p: ({ children }) => <p className="mt-3 text-sage-800">{children}</p>,
    ul: ({ children }) => <ul className="mt-3 list-disc space-y-1 pl-5 text-sage-800">{children}</ul>,
    ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1 pl-5 text-sage-800">{children}</ol>,
    a: ({ children, href }) => (
      <a href={href} className="text-warm-500 underline hover:text-warm-700">
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="rounded bg-sage-100 px-1 py-0.5 text-xs">{children}</code>
    ),
    ...components,
  };
}
