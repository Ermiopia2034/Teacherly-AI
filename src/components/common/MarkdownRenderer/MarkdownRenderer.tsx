'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';

const MarkdownRenderer = ({ markdownContent }: { markdownContent: string }) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          rehypeHighlight,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
          [rehypeKatex, { throwOnError: false, strict: 'ignore', trust: true }],
        ]}
        components={{
          a: (props: React.ComponentPropsWithoutRef<'a'>) => (
            <a
              {...props}
              target={props.href?.startsWith('#') ? undefined : '_blank'}
              rel={props.href?.startsWith('#') ? undefined : 'noopener noreferrer'}
            />
          ),
          table: (props: React.ComponentPropsWithoutRef<'table'>) => (
            <div style={{ overflowX: 'auto' }}>
              <table {...props} />
            </div>
          ),
          // Ensure display math blocks don't overflow horizontally
          div: (props: React.ComponentPropsWithoutRef<'div'>) => {
            const { className, ...rest } = props;
            if (className && className.includes('katex-display')) {
              return <div style={{ overflowX: 'auto' }} className={className} {...rest} />;
            }
            return <div className={className} {...rest} />;
          },
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;