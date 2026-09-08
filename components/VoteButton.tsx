'use client';

import React, { useState } from 'react';

interface VoteButtonProps {
  serverId: string;
  initialVotes: number;
}

export default function VoteButton({ serverId, initialVotes }: VoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async () => {
    if (loading || hasVoted) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId })
      });

      const data = await res.json();
      if (data.success && data.newCount) {
        setVotes(data.newCount);
        setHasVoted(true);
        setMessage('Vote registered successfully!');
      } else {
        setMessage(data.message || 'Vote already submitted today.');
      }
    } catch {
      setMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sidebar-panel vote-sidebar-panel">
      <div className="panel-header">VOTE FOR SERVER</div>
      <p className="vote-sidebar-desc">
        Support this server to help maintain its rank on the GTA V directory. You can vote once every 24 hours.
      </p>

      <div className="vote-counter-display">
        <span className="vote-num" id="sidebar-vote-count">
          {votes}
        </span>
        <span className="vote-label">Total Upvotes</span>
      </div>

      <button
        type="button"
        className={`btn-vote-submit ${hasVoted ? 'voted' : ''}`}
        id="btn-vote-action"
        onClick={handleVote}
        disabled={loading || hasVoted}
      >
        {loading ? 'CASTING VOTE...' : hasVoted ? '✓ VOTED TODAY' : '▲ VOTE FOR THIS SERVER'}
      </button>

      {message && (
        <div style={{
          marginTop: '10px',
          padding: '8px 10px',
          backgroundColor: '#0a0b0e',
          border: '1px solid var(--card-border)',
          borderRadius: '6px',
          fontSize: '11.5px',
          color: hasVoted ? '#4ade80' : 'var(--text-light)',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
