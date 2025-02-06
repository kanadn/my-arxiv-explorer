import React from 'react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import './BookmarksSidebar.css';

function BookmarksSidebar({ bookmarks, onBookmarkClick, onClose }) {
  return (
    <div className="bookmarks-sidebar">
      <div className="sidebar-header">
        <h3>Bookmarked Papers</h3>
        <button onClick={onClose} className="close-btn">✖</button>
      </div>
      {bookmarks.length === 0 ? (
        <p className="no-bookmarks">No bookmarks yet.</p>
      ) : (
        <ul className="bookmark-list">
          {bookmarks.map((paper) => (
            <li key={paper.pdfLink} className="bookmark-item" onClick={() => onBookmarkClick(paper)}>
              <Latex>{paper.title}</Latex>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BookmarksSidebar;
