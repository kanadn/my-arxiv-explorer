import React, { useEffect, useState, useCallback } from 'react';
import PaperCard from './PaperCard';
import Footer from './Footer';
import BookmarksSidebar from './BookmarksSidebar';
import { useSwipeable } from 'react-swipeable';
import { Analytics } from "@vercel/analytics/react"
import './App.css';

const ARXIV_API_URL =
  'https://export.arxiv.org/api/query?search_query=cat:cs.AI&max_results=100&sortBy=submittedDate&sortOrder=descending';

function App() {
  const [papers, setPapers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Load bookmarks and dark mode setting from localStorage
  useEffect(() => {
    const storedBookmarks = localStorage.getItem('bookmarkedPapers');
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode));
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem('darkMode', JSON.stringify(!prev));
      return !prev;
    });
  };

  const toggleBookmark = (paper) => {
    const isBookmarked = bookmarks.some((b) => b.pdfLink === paper.pdfLink);
    let updatedBookmarks;
    if (isBookmarked) {
      updatedBookmarks = bookmarks.filter((b) => b.pdfLink !== paper.pdfLink);
    } else {
      updatedBookmarks = [...bookmarks, paper];
    }
    setBookmarks(updatedBookmarks);
    localStorage.setItem('bookmarkedPapers', JSON.stringify(updatedBookmarks));
  };

  const isBookmarked = (paper) => {
    return bookmarks.some((b) => b.pdfLink === paper.pdfLink);
  };

  // Fetch and parse the arXiv API (Atom XML) response
  const fetchPapers = async () => {
    try {
      const response = await fetch(ARXIV_API_URL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'application/xml');
      const entries = xml.getElementsByTagName('entry');
      let fetchedPapers = [];
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const title =
          entry.getElementsByTagName('title')[0]?.textContent.trim() ||
          'No title';
        const summary =
          entry.getElementsByTagName('summary')[0]?.textContent.trim() ||
          'No abstract';
        const published =
          entry.getElementsByTagName('published')[0]?.textContent ||
          'No publish date';
        // Get first three authors
        const authorNodes = entry.getElementsByTagName('author');
        let authors = [];
        for (let j = 0; j < Math.min(3, authorNodes.length); j++) {
          const name =
            authorNodes[j].getElementsByTagName('name')[0]?.textContent.trim();
          if (name) authors.push(name);
        }
        if (authorNodes.length > 3) {
          authors.push('et al.');
        }
        // Get pdf link
        let pdfLink = '';
        const linkNodes = entry.getElementsByTagName('link');
        for (let k = 0; k < linkNodes.length; k++) {
          const linkEl = linkNodes[k];
          if (linkEl.getAttribute('type') === 'application/pdf') {
            pdfLink = linkEl.getAttribute('href');
            break;
          }
        }
        fetchedPapers.push({ title, summary, published, authors, pdfLink });
      }
      // Randomize order
      fetchedPapers = fetchedPapers.sort(() => Math.random() - 0.5);
      setPapers(fetchedPapers);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching papers:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % papers.length);
  }, [papers]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + papers.length) % papers.length);
  }, [papers]);

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => handleNext(),
    onSwipedDown: () => handlePrev(),
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
  });

  // Desktop: arrow keys and mouse wheel
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowUp') {
        handlePrev();
      } else if (event.key === 'ArrowDown') {
        handleNext();
      }
    },
    [handleNext, handlePrev]
  );

  const handleWheel = useCallback(
    (event) => {
      if (event.deltaY > 0) {
        handleNext();
      } else if (event.deltaY < 0) {
        handlePrev();
      }
    },
    [handleNext, handlePrev]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleKeyDown, handleWheel]);

  // When a bookmark in the sidebar is clicked, find its index in papers and display it.
  const handleBookmarkClick = (bookmarkPaper) => {
    const index = papers.findIndex(
      (p) => p.pdfLink === bookmarkPaper.pdfLink
    );
    if (index !== -1) {
      setCurrentIndex(index);
      setShowBookmarks(false);
    }
  };

  if (loading) {
    return (
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        <p>Loading papers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        <p>No papers found.</p>
      </div>
    );
  }

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`} {...swipeHandlers}>
      <div className="top-bar">
        <button onClick={toggleDarkMode} className="toggle-mode-btn">
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button onClick={() => setShowBookmarks(!showBookmarks)} className="toggle-bookmarks-btn">
          📑
        </button>
      </div>
      <div className="main-content">
        <PaperCard
          key={currentIndex}
          paper={papers[currentIndex]}
          onBookmark={() => toggleBookmark(papers[currentIndex])}
          bookmarked={isBookmarked(papers[currentIndex])}
        />
      </div>
      {showBookmarks && (
        <>
          <div className="overlay" onClick={() => setShowBookmarks(false)}></div>
          <BookmarksSidebar 
            bookmarks={bookmarks} 
            onBookmarkClick={handleBookmarkClick} 
            onClose={() => setShowBookmarks(false)}
          />
        </>
      )}
      <Footer />
      <Analytics />
    </div>
  );
}

export default App;
