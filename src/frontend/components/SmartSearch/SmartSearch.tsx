import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Image from 'next/image';

const SearchContainer = styled.div`
  position: relative;
  margin-right: 20px;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 8px 15px 8px 35px;
  color: white;
  width: 250px;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);

  &:focus {
    width: 350px;
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  pointer-events: none;
  opacity: 0.6;
`;

const ResultsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(20, 20, 30, 0.9);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

const ResultItem = styled.div`
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ResultTitle = styled.div`
  font-weight: 600;
  color: white;
  font-size: 14px;
`;

const ResultSummary = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
`;

const SmartSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async (val: string) => {
    setQuery(val);
    if (val.length > 2) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        setResults(data);
        setShowResults(true);
      } catch (err) {
        console.error('Search failed', err);
      }
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, []);

  return (
    <SearchContainer>
      <SearchIcon>
        <Image src="/icons/Search.svg" width={16} height={16} alt="search" />
      </SearchIcon>
      <SearchInput
        placeholder="AI Semantic Search..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        onFocus={() => query.length > 2 && setShowResults(true)}
      />
      {showResults && results.length > 0 && (
        <ResultsDropdown>
          {results.map((res) => (
            <ResultItem key={res.product_id} onClick={() => router.push(`/product/${res.product_id}`)}>
              <ResultTitle>{res.product_id}</ResultTitle>
              <ResultSummary>{res.summary}</ResultSummary>
            </ResultItem>
          ))}
        </ResultsDropdown>
      )}
    </SearchContainer>
  );
};

export default SmartSearch;
