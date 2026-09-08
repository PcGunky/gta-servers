'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitFormClient() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    port: '30120',
    game: 'GTA 5',
    game_version: 'v1.0.3095',
    platform: 'FiveM',
    server_type: 'Roleplay',
    game_mode: 'Serious RP',
    region: 'Europe',
    country: 'Germany',
    language: 'German',
    description: '',
    long_description: '',
    website_url: '',
    discord_url: '',
    banner_url: '',
    cfx_url: '',
    logo_url: '',
    rules: 'Strict In-Character roleplay required.\nValue of Life rules enforced.\nNo cheating or exploits.',
    max_players: '1000',
    current_players: '0'
  });

  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState<{
    online: boolean;
    players: number;
    maxPlayers: number;
    cleanName: string;
    source: string;
    logoUrl?: string;
    ip?: string;
    port?: number;
    cfxCode?: string;
  } | null>(null);
  const [pingError, setPingError] = useState<string | null>(null);

  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Roleplay', 'Voice Chat', 'Custom Cars', 'Active Admins'
  ]);

  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const availableTags = [
    'Roleplay', 'Serious RP', 'Voice Chat', 'Custom Cars', 'Economy System',
    'Whitelist', 'Active Admins', 'Freeroam', 'PvP', 'Racing', 'Stunts',
    'Mini Games', 'Custom Scripts', 'Gangs', 'No Pay2Win'
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'banner_url') {
      setBannerPreview(value.trim());
    }
    if (error) setError(null);
    if (name === 'cfx_url' && pingError) setPingError(null);
  };

  const handleTestCfx = async () => {
    const rawTarget = (formData.cfx_url || formData.ip || '').trim();
    if (!rawTarget) {
      setPingError('Please enter a Cfx.re join link or server code first.');
      return;
    }
    setPingLoading(true);
    setPingError(null);
    try {
      const res = await fetch(`/api/servers/ping?cfx=${encodeURIComponent(rawTarget)}&ip=${encodeURIComponent(formData.ip.trim())}&port=${formData.port}&nocache=true`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setPingError(data.error || 'Server check failed. Please check the connect link.');
        setPingResult(null);
      } else {
        setPingResult(data);
        if (data.online) {
          // Automatically auto-fill form fields
          setFormData(prev => ({
            ...prev,
            name: data.cleanName || prev.name,
            ip: data.ip && !data.ip.includes('cfx.re') ? data.ip : prev.ip,
            port: data.port ? String(data.port) : prev.port,
            current_players: String(data.players ?? prev.current_players),
            max_players: data.maxPlayers ? String(data.maxPlayers) : prev.max_players,
            logo_url: data.logoUrl || prev.logo_url,
            cfx_url: data.cfxCode ? `cfx.re/join/${data.cfxCode}` : prev.cfx_url
          }));
        }
      }
    } catch (err: any) {
      setPingError(err.message || 'Failed to connect to FiveM query API');
      setPingResult(null);
    } finally {
      setPingLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic client validation
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      setError('Please enter a server name with at least 3 characters.');
      return;
    }
    if (!formData.ip.trim()) {
      setError('Please enter a server IP or connection hostname.');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setError('Please enter a short description with at least 10 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/servers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          port: Number(formData.port) || 30120,
          max_players: Number(formData.max_players) || 1000,
          current_players: Number(formData.current_players) || 0,
          tags: selectedTags,
          rules: formData.rules.split('\n').map(r => r.trim()).filter(Boolean)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit server');
      }

      setSuccess(`🎉 Server submitted successfully! It is now pending staff review in our Discord verification channel and will go live automatically once accepted.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="submit-form-container">
      {/* Feedback Alerts */}
      {error && (
        <div className="submit-alert-error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="submit-alert-success" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* Section 1: Connection & Core Info */}
      <div className="form-card-panel">
        <h3 className="form-panel-title">1. SERVER CONNECTION & IDENTITY</h3>
        <p className="form-panel-desc">Provide direct connection details so players can join instantly with one click.</p>

        {/* FiveM / Cfx.re Connect Link Input */}
        <div className="form-field-group cfx-connect-field-group">
          <div className="cfx-header-bar">
            <div className="cfx-header-title-wrap">
              <div className="cfx-icon-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <span>FIVEM CFX.RE CONNECT</span>
              </div>
              <span className="cfx-headline">Direct Join & Instant Auto-Detect</span>
            </div>
            <span className="cfx-subhint">Paste link <code>cfx.re/join/5dg4mr</code> or code <code>5dg4mr</code></span>
          </div>

          <div className="cfx-input-row">
            <div className="cfx-search-box">
              <span className="cfx-link-symbol">🔗</span>
              <input
                type="text"
                id="cfx_url"
                name="cfx_url"
                className="cfx-search-input"
                placeholder="Paste Cfx.re link (e.g. cfx.re/join/5dg4mr) or code (5dg4mr)"
                value={formData.cfx_url}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTestCfx();
                  }
                }}
              />
              {formData.cfx_url && (
                <button
                  type="button"
                  className="cfx-clear-btn"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, cfx_url: '' }));
                    setPingResult(null);
                    setPingError(null);
                  }}
                  title="Clear input"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              className="btn-cfx-test"
              onClick={handleTestCfx}
              disabled={pingLoading}
            >
              {pingLoading ? (
                <>
                  <span className="spinner-dot"></span>
                  <span>FETCHING...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                  <span>TEST & AUTOFILL</span>
                </>
              )}
            </button>
          </div>

          {/* Ping result status preview */}
          {pingResult && pingResult.online && (
            <div className="cfx-status-card cfx-card-online">
              <div className="cfx-status-avatar-col">
                {pingResult.logoUrl ? (
                  <img src={pingResult.logoUrl} alt={pingResult.cleanName} className="cfx-server-icon" />
                ) : (
                  <div className="cfx-avatar-fallback">🎮</div>
                )}
              </div>
              <div className="cfx-status-info-col">
                <div className="cfx-status-top-line">
                  <span className="cfx-pulse-badge">
                    <span className="cfx-pulse-dot"></span>
                    ONLINE
                  </span>
                  <span className="cfx-server-title-text">{pingResult.cleanName || 'FiveM Server'}</span>
                </div>
                <div className="cfx-status-meta-row">
                  <span className="cfx-metric-pill">
                    👥 <strong>{pingResult.players}</strong> / {pingResult.maxPlayers} Players
                  </span>
                  {pingResult.ip && (
                    <span className="cfx-metric-pill">
                      🌐 {pingResult.ip}:{pingResult.port || 30120}
                    </span>
                  )}
                  <span className="cfx-autofill-tag">
                    ⚡ Verified & Auto-Filled
                  </span>
                </div>
              </div>
            </div>
          )}

          {pingResult && !pingResult.online && (
            <div className="cfx-status-card cfx-card-offline">
              <div className="cfx-offline-icon-wrap">⚠️</div>
              <div className="cfx-status-info-col">
                <div className="cfx-status-top-line">
                  <span className="cfx-pulse-badge offline">
                    <span className="cfx-pulse-dot red"></span>
                    SERVER UNREACHABLE
                  </span>
                </div>
                <p className="cfx-offline-desc">
                  Could not reach FiveM endpoint for <code>{formData.cfx_url || formData.ip}</code>. Verify the server is running or check the code.
                </p>
              </div>
            </div>
          )}

          {pingError && (
            <div className="cfx-status-card cfx-card-offline">
              <span className="cfx-error-text">⚠️ {pingError}</span>
            </div>
          )}
        </div>

        <div className="form-grid-2col">
          <div className="form-field-group">
            <label className="form-label" htmlFor="name">
              SERVER NAME <span className="field-required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="form-input-text"
              placeholder="e.g. Los Santos Roleplay | Custom Vehicles"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-grid-ip-port">
            <div className="form-field-group">
              <label className="form-label" htmlFor="ip">
                IP OR HOSTNAME <span className="field-required">*</span>
              </label>
              <input
                type="text"
                id="ip"
                name="ip"
                required
                className="form-input-text"
                placeholder="e.g. play.myserver.com"
                value={formData.ip}
                onChange={handleChange}
              />
            </div>

            <div className="form-field-group">
              <label className="form-label" htmlFor="port">
                PORT <span className="field-required">*</span>
              </label>
              <input
                type="number"
                id="port"
                name="port"
                required
                className="form-input-text"
                placeholder="30120"
                value={formData.port}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-grid-3col">
          <div className="form-field-group">
            <label className="form-label" htmlFor="game">GAME</label>
            <select id="game" name="game" className="form-select" value={formData.game} onChange={handleChange}>
              <option value="GTA 5">GTA 5</option>
              <option value="GTA 6">GTA 6</option>
            </select>
          </div>

          <div className="form-field-group">
            <label className="form-label" htmlFor="platform">PLATFORM</label>
            <select id="platform" name="platform" className="form-select" value={formData.platform} onChange={handleChange}>
              <option value="FiveM">FiveM</option>
              <option value="RageMP">RageMP</option>
              <option value="alt:V">alt:V</option>
            </select>
          </div>

          <div className="form-field-group">
            <label className="form-label" htmlFor="server_type">CATEGORY</label>
            <select id="server_type" name="server_type" className="form-select" value={formData.server_type} onChange={handleChange}>
              <option value="Roleplay">Roleplay</option>
              <option value="Freeroam">Freeroam</option>
              <option value="PvP">PvP & Gangwar</option>
              <option value="Racing">Racing</option>
              <option value="Stunts">Stunt Racing</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-grid-3col">
          <div className="form-field-group">
            <label className="form-label" htmlFor="country">COUNTRY</label>
            <select id="country" name="country" className="form-select" value={formData.country} onChange={handleChange}>
              <option value="Germany">Germany (DE)</option>
              <option value="United States">United States (US)</option>
              <option value="United Kingdom">United Kingdom (GB)</option>
              <option value="France">France (FR)</option>
              <option value="Arabia">Arabia / Saudi Arabia (AR)</option>
              <option value="Europe">Europe (EU)</option>
              <option value="Austria">Austria (AT)</option>
              <option value="Switzerland">Switzerland (CH)</option>
              <option value="Canada">Canada (CA)</option>
              <option value="Turkey">Turkey (TR)</option>
              <option value="Brazil">Brazil (BR)</option>
              <option value="Spain">Spain (ES)</option>
              <option value="Italy">Italy (IT)</option>
              <option value="Netherlands">Netherlands (NL)</option>
              <option value="Poland">Poland (PL)</option>
              <option value="Russia">Russia (RU)</option>
              <option value="Australia">Australia (AU)</option>
              <option value="Sweden">Sweden (SE)</option>
              <option value="International">International</option>
            </select>
          </div>

          <div className="form-field-group">
            <label className="form-label" htmlFor="language">PRIMARY LANGUAGE</label>
            <select id="language" name="language" className="form-select" value={formData.language} onChange={handleChange}>
              <option value="German">German</option>
              <option value="English">English</option>
              <option value="Arabic">Arabic</option>
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
              <option value="Turkish">Turkish</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Italian">Italian</option>
              <option value="Russian">Russian</option>
              <option value="Polish">Polish</option>
              <option value="Multilingual">Multilingual</option>
            </select>
          </div>

          <div className="form-field-group">
            <label className="form-label" htmlFor="max_players">MAX PLAYER SLOTS</label>
            <input
              type="number"
              id="max_players"
              name="max_players"
              className="form-input-text"
              value={formData.max_players}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Descriptions & Media */}
      <div className="form-card-panel">
        <h3 className="form-panel-title">2. SERVER DESCRIPTION & BRANDING</h3>
        <p className="form-panel-desc">Showcase your server to attract new players.</p>

        <div className="form-field-group">
          <label className="form-label" htmlFor="description">
            SHORT SUMMARY (Search Card & Meta Description) <span className="field-required">*</span>
          </label>
          <input
            type="text"
            id="description"
            name="description"
            required
            maxLength={160}
            className="form-input-text"
            placeholder="e.g. Serious RP · Custom Economy · Active Police & EMS · 200+ Handcrafted Cars"
            value={formData.description}
            onChange={handleChange}
          />
          <span className="field-hint">Max 160 characters. Displayed on search results and server cards.</span>
        </div>

        <div className="form-field-group">
          <label className="form-label" htmlFor="long_description">
            DETAILED ABOUT SECTION
          </label>
          <textarea
            id="long_description"
            name="long_description"
            rows={4}
            className="form-textarea"
            placeholder="Describe what makes your server unique, features, whitelisting process, community lore, etc."
            value={formData.long_description}
            onChange={handleChange}
          />
        </div>

        <div className="form-grid-2col">
          <div className="form-field-group">
            <label className="form-label" htmlFor="banner_url">
              BANNER IMAGE URL (520×105 or standard banner)
            </label>
            <input
              type="url"
              id="banner_url"
              name="banner_url"
              className="form-input-text"
              placeholder="https://example.com/banner.gif"
              value={formData.banner_url}
              onChange={handleChange}
            />
            <span className="field-hint" style={{ color: '#00f0ff', fontSize: '11px', display: 'block', marginTop: '6px' }}>
              All server submissions, descriptions, rules, and media are screened in our Discord verification channel. Inappropriate, NSFW, scam, or infringing content results in an immediate blacklist.
            </span>
            {bannerPreview && (
              <div className="banner-preview-wrap">
                <span className="preview-label">Banner Preview:</span>
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="banner-preview-img"
                  onError={() => setBannerPreview('')}
                />
              </div>
            )}
          </div>

          <div className="form-field-group">
            <label className="form-label" htmlFor="rules">
              SERVER RULES & GUIDELINES (One per line)
            </label>
            <textarea
              id="rules"
              name="rules"
              rows={3}
              className="form-textarea"
              placeholder="Rule 1&#10;Rule 2&#10;Rule 3"
              value={formData.rules}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-grid-2col">
          <div className="form-field-group">
            <label className="form-label" htmlFor="website_url">WEBSITE URL</label>
            <input
              type="url"
              id="website_url"
              name="website_url"
              className="form-input-text"
              placeholder="https://myserver.com"
              value={formData.website_url}
              onChange={handleChange}
            />
          </div>

          <div className="form-field-group">
            <label className="form-label" htmlFor="discord_url">DISCORD INVITE LINK</label>
            <input
              type="url"
              id="discord_url"
              name="discord_url"
              className="form-input-text"
              placeholder="https://discord.gg/yourserver"
              value={formData.discord_url}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Feature Tags */}
      <div className="form-card-panel">
        <h3 className="form-panel-title">3. FEATURES & TAGS</h3>
        <p className="form-panel-desc">Select badges that highlight your server's key selling points.</p>

        <div className="tags-selection-grid">
          {availableTags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className={`tag-toggle-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                <span className="tag-check-indicator">{isSelected ? '✓' : '+'}</span>
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Actions */}
      <div className="form-submit-row">
        <button
          type="submit"
          disabled={loading}
          className="btn-submit-server"
        >
          {loading ? (
            <>
              <span className="spinner-dot"></span>
              PUBLISHING SERVER...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              PUBLISH SERVER TO DIRECTORY
            </>
          )}
        </button>
      </div>
    </form>
  );
}
