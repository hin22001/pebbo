import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Typography } from '@mui/material';

const MarkdownRenderer = ({ children, className, ...props }) => {
  const components = {
    // Override paragraph to use Typography
    p: ({ children }) => (
      <Typography 
        className={className}
        component="span"
        sx={{ 
          display: 'inline',
          lineHeight: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit'
        }}
        {...props}
      >
        {children}
      </Typography>
    ),
    // Style headers
    h1: ({ children }) => (
      <Typography 
        variant="h6" 
        component="div" 
        sx={{ fontWeight: 'bold', mt: 1, mb: 0.5 }}
      >
        {children}
      </Typography>
    ),
    h2: ({ children }) => (
      <Typography 
        variant="subtitle1" 
        component="div" 
        sx={{ fontWeight: 'bold', mt: 1, mb: 0.5 }}
      >
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography 
        variant="subtitle2" 
        component="div" 
        sx={{ fontWeight: 'bold', mt: 0.5, mb: 0.25 }}
      >
        {children}
      </Typography>
    ),
    // Style emphasis
    strong: ({ children }) => (
      <Typography 
        component="strong" 
        sx={{ 
          fontWeight: 'bold', 
          display: 'inline',
          fontSize: 'inherit',
          color: 'inherit'
        }}
      >
        {children}
      </Typography>
    ),
    em: ({ children }) => (
      <Typography 
        component="em" 
        sx={{ 
          fontStyle: 'italic', 
          display: 'inline',
          fontSize: 'inherit',
          color: 'inherit'
        }}
      >
        {children}
      </Typography>
    ),
    // Style code
    code: ({ children, className }) => {
      const isInline = !className;
      return (
        <Typography
          component={isInline ? 'code' : 'pre'}
          sx={{
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            fontSize: isInline ? '0.9em' : '0.875em', // Slightly larger for inline code
            backgroundColor: '#f5f5f5',
            padding: isInline ? '0.125em 0.25em' : '0.5em',
            borderRadius: '0.25em',
            display: isInline ? 'inline' : 'block',
            whiteSpace: isInline ? 'nowrap' : 'pre-wrap',
            border: '1px solid #e0e0e0'
          }}
        >
          {children}
        </Typography>
      );
    },
    // Style lists
    ul: ({ children }) => (
      <Typography 
        component="ul" 
        sx={{ 
          pl: 2, 
          my: 0.5,
          '& li': {
            mb: 0.25
          }
        }}
      >
        {children}
      </Typography>
    ),
    ol: ({ children }) => (
      <Typography 
        component="ol" 
        sx={{ 
          pl: 2, 
          my: 0.5,
          '& li': {
            mb: 0.25
          }
        }}
      >
        {children}
      </Typography>
    ),
    li: ({ children }) => (
      <Typography 
        component="li" 
        sx={{ 
          fontSize: 'inherit', 
          color: 'inherit',
          lineHeight: 'inherit'
        }}
      >
        {children}
      </Typography>
    ),
    // Style blockquotes
    blockquote: ({ children }) => (
      <Typography
        component="blockquote"
        sx={{
          borderLeft: '4px solid #e0e0e0',
          pl: 2,
          py: 0.5,
          my: 1,
          fontStyle: 'italic',
          backgroundColor: '#f9f9f9'
        }}
      >
        {children}
      </Typography>
    ),
    // Style line breaks
    br: () => <br />
  };

  return (
    <ReactMarkdown components={components}>
      {children}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;