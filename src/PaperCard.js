import React from 'react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import './PaperCard.css';

function PaperCard({ paper, onBookmark, bookmarked }) {
  const { title, summary, published, authors, pdfLink } = paper;

  return (
    <div className="paper-card">
      <div className="card-header">
        <h2 className="paper-title">
          <Latex>{title}</Latex>
        </h2>
      </div>
      <p className="paper-authors">
        <Latex>{authors.join(', ')}</Latex>
      </p>
      <p className="paper-published">
        Published: {new Date(published).toLocaleDateString()}
      </p>
      <div className="paper-abstract">
        <Latex>{summary}</Latex>
      </div>
      <button className="bookmark-btn" onClick={onBookmark}>
        {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
      </button>
      <a
        href={pdfLink}
        target="_blank"
        rel="noopener noreferrer"
        className="paper-link"
      >
        View PDF
      </a>
    </div>
  );
}

export default PaperCard;
