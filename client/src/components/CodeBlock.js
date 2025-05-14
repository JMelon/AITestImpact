import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter
      style={vscDarkPlus}
      language={match[1]}
      PreTag="div"
      customStyle={{ 
        margin: '1rem 0', 
        borderRadius: '0.375rem' 
      }}
      showLineNumbers={true}
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className ? `${className} bg-gray-800 px-1 rounded` : 'bg-gray-800 px-1 rounded'} {...props}>
      {children}
    </code>
  );
};

export default CodeBlock;
