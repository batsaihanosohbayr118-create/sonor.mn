import React, { useRef } from 'react';
import { useRouter } from 'next/router';

export default function SearchBar({ isSearchOpen, closeSearch }) {
  const router = useRouter();
  const searchInputRef = useRef(null);

  const handleSearch = (e) => {
    if (e.target.value.trim()) {
      router.push(`/politics?search=${encodeURIComponent(e.target.value)}`);
    } else {
      router.push('/'); // Go to home if search is empty
    }
    closeSearch();
  };

  return (
    <div className={`searchbar ${isSearchOpen ? 'open' : ''}`}>
      <div className="wrap">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Мэдээ хайх — гарчиг, түлхүүр үг..."
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
        />
      </div>
    </div>
  );
}
