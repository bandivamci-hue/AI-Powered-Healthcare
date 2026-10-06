import React from 'react';

/**
 * Safe, lightweight, high-performance Markdown renderer for AI chat messages.
 * Formats bold (**text**), italics (*text*), bullet lists (- item), numbered lists (1. item),
 * headers (### text), and clean paragraph breaks without raw asterisks.
 */
export const MarkdownContent = ({ content, style = {} }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let listType = null; // 'ul' or 'ol'

  const parseInlineFormatting = (text) => {
    // Regex matches **bold**, *italic*, `code`
    const parts = [];
    let lastIndex = 0;
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|(`)(.*?)\5/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      if (match[2]) {
        // Bold
        parts.push(<strong key={match.index} style={{ fontWeight: 700 }}>{match[2]}</strong>);
      } else if (match[4]) {
        // Italic
        parts.push(<em key={match.index} style={{ fontStyle: 'italic' }}>{match[4]}</em>);
      } else if (match[6]) {
        // Code
        parts.push(<code key={match.index} style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.9em' }}>{match[6]}</code>);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} style={{ margin: '6px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {currentList.map((item, idx) => (
              <li key={idx} style={{ lineHeight: '1.5' }}>{item}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} style={{ margin: '6px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {currentList.map((item, idx) => (
              <li key={idx} style={{ lineHeight: '1.5' }}>{item}</li>
            ))}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  lines.forEach((rawLine, lineIdx) => {
    const line = rawLine.trim();

    // Empty line -> paragraph separator
    if (!line) {
      flushList();
      return;
    }

    // Header 1-4
    if (line.startsWith('#')) {
      flushList();
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#+\s*/, '');
      const fontSize = level === 1 ? '18px' : level === 2 ? '16px' : '15px';
      elements.push(
        <div key={`h-${lineIdx}`} style={{ fontSize, fontWeight: 700, margin: '8px 0 4px', color: 'inherit' }}>
          {parseInlineFormatting(text)}
        </div>
      );
      return;
    }

    // Bullet list item (- or *)
    if (line.match(/^[-*+]\s+/)) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      const text = line.replace(/^[-*+]\s+/, '');
      currentList.push(parseInlineFormatting(text));
      return;
    }

    // Numbered list item (1. or 2.)
    if (line.match(/^\d+\.\s+/)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      const text = line.replace(/^\d+\.\s+/, '');
      currentList.push(parseInlineFormatting(text));
      return;
    }

    // Standard paragraph
    flushList();
    elements.push(
      <p key={`p-${lineIdx}`} style={{ margin: '4px 0', lineHeight: '1.6' }}>
        {parseInlineFormatting(line)}
      </p>
    );
  });

  flushList();

  return (
    <div style={{ ...style, wordBreak: 'break-word' }}>
      {elements}
    </div>
  );
};

export default MarkdownContent;
