import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SearchService, SearchResult, SearchFilters, SearchSuggestion } from '../../services/search.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="search-page">
      <!-- Search Header -->
      <section class="search-header">
        <div class="container">
          <div class="search-header-content">
            <h1>Search CreaDEvents</h1>
            <p>Find exactly what you're looking for</p>
            
            <!-- Main Search Bar -->
            <div class="search-bar-container">
              <div class="search-bar" [class.focused]="searchFocused()" [class.has-results]="showSuggestions()">
                <div class="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search for services, projects, blog posts..."
                    [value]="currentQuery()"
                    (input)="onSearchInput($event)"
                    (focus)="onSearchFocus()"
                    (blur)="onSearchBlur()"
                    (keydown)="onSearchKeydown($event)"
                    class="search-input"
                    #searchInput>
                  
                  <button
                    type="button"
                    (click)="performSearch()"
                    class="search-button"
                    [disabled]="!currentQuery()">
                    <span class="search-icon">🔍</span>
                  </button>
                  
                  @if (currentQuery()) {
                    <button
                      type="button"
                      (click)="clearSearch()"
                      class="clear-button">
                      ✕
                    </button>
                  }
                </div>

                <!-- Search Suggestions -->
                @if (showSuggestions()) {
                  <div class="search-suggestions">
                    @if (isSearching()) {
                      <div class="suggestion-item loading">
                        <span class="loading-spinner"></span>
                        Searching...
                      </div>
                    } @else {
                      @for (suggestion of searchSuggestions(); track suggestion.text) {
                        <button
                          type="button"
                          (click)="selectSuggestion(suggestion)"
                          class="suggestion-item"
                          [class]="'suggestion-' + suggestion.type">
                          <span class="suggestion-icon">
                            @switch (suggestion.type) {
                              @case ('query') { 🔍 }
                              @case ('category') { 📁 }
                              @case ('tag') { 🏷️ }
                            }
                          </span>
                          <span class="suggestion-text">{{ suggestion.text }}</span>
                          @if (suggestion.count) {
                            <span class="suggestion-count">{{ suggestion.count }}</span>
                          }
                        </button>
                      }
                    }
                    
                    @if (recentSearches().length > 0 && !currentQuery()) {
                      <div class="suggestion-section">
                        <div class="suggestion-header">Recent Searches</div>
                        @for (search of recentSearches().slice(0, 5); track search) {
                          <button
                            type="button"
                            (click)="selectSuggestion({text: search, type: 'query'})"
                            class="suggestion-item suggestion-recent">
                            <span class="suggestion-icon">🕒</span>
                            <span class="suggestion-text">{{ search }}</span>
                          </button>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Quick Filters -->
            <div class="quick-filters">
              @for (type of contentTypes; track type.key) {
                <button
                  type="button"
                  (click)="toggleContentType(type.key)"
                  class="filter-chip"
                  [class.active]="selectedFilters().contentTypes.includes(type.key)">
                  <span class="filter-icon">{{ type.icon }}</span>
                  {{ type.label }}
                  @if (getTypeCount(type.key) > 0) {
                    <span class="filter-count">{{ getTypeCount(type.key) }}</span>
                  }
                </button>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Search Results -->
      <section class="search-results-section">
        <div class="container">
          <div class="search-results-layout">
            
            <!-- Sidebar Filters -->
            <aside class="search-sidebar">
              <div class="sidebar-content">
                <h3>Filters</h3>
                
                <!-- Sort Options -->
                <div class="filter-group">
                  <h4>Sort By</h4>
                  <div class="sort-options">
                    @for (option of sortOptions; track option.value) {
                      <label class="radio-option">
                        <input
                          type="radio"
                          [value]="option.value"
                          [checked]="selectedFilters().sortBy === option.value"
                          (change)="updateSortBy(option.value)">
                        <span class="radio-label">{{ option.label }}</span>
                      </label>
                    }
                  </div>
                </div>

                <!-- Categories Filter -->
                <div class="filter-group">
                  <h4>Categories</h4>
                  <div class="category-filters">
                    @for (category of availableCategories; track category) {
                      <label class="checkbox-option">
                        <input
                          type="checkbox"
                          [checked]="selectedFilters().categories.includes(category)"
                          (change)="toggleCategory(category, $event)">
                        <span class="checkbox-label">{{ category | titlecase }}</span>
                      </label>
                    }
                  </div>
                </div>

                <!-- Clear Filters -->
                @if (hasActiveFilters()) {
                  <button
                    type="button"
                    (click)="clearFilters()"
                    class="clear-filters-btn">
                    Clear All Filters
                  </button>
                }
              </div>
            </aside>

            <!-- Main Results -->
            <main class="search-main">
              @if (hasSearched()) {
                <div class="search-results-header">
                  <div class="results-info">
                    @if (isSearching()) {
                      <p>Searching...</p>
                    } @else if (hasResults()) {
                      <p>
                        Found <strong>{{ resultCount() }}</strong> results for 
                        <strong>"{{ currentQuery() }}"</strong>
                      </p>
                    } @else {
                      <p>No results found for <strong>"{{ currentQuery() }}"</strong></p>
                    }
                  </div>
                  
                  @if (hasResults()) {
                    <div class="view-toggle">
                      <button
                        type="button"
                        (click)="setViewMode('list')"
                        class="view-btn"
                        [class.active]="viewMode() === 'list'">
                        ☰ List
                      </button>
                      <button
                        type="button"
                        (click)="setViewMode('grid')"
                        class="view-btn"
                        [class.active]="viewMode() === 'grid'">
                        ⊞ Grid
                      </button>
                    </div>
                  }
                </div>

                @if (isSearching()) {
                  <div class="search-loading">
                    <div class="loading-spinner-large"></div>
                    <p>Searching through our content...</p>
                  </div>
                } @else if (hasResults()) {
                  <div class="search-results" [class]="'view-' + viewMode()">
                    @for (result of searchResults(); track result.id) {
                      <article class="search-result-item" [class]="'result-' + result.type">
                        <div class="result-content">
                          @if (result.imageUrl) {
                            <div class="result-image">
                              <img [src]="result.imageUrl" [alt]="result.title" loading="lazy">
                              <div class="result-type-badge">{{ getTypeLabel(result.type) }}</div>
                            </div>
                          }
                          
                          <div class="result-info">
                            <div class="result-meta">
                              <span class="result-type">{{ getTypeLabel(result.type) }}</span>
                              @if (result.category) {
                                <span class="result-category">{{ result.category | titlecase }}</span>
                              }
                              @if (result.date) {
                                <span class="result-date">{{ formatDate(result.date) }}</span>
                              }
                            </div>
                            
                            <h3 class="result-title">
                              <a [routerLink]="result.url" [innerHTML]="result.highlightedTitle || result.title"></a>
                            </h3>
                            
                            <p class="result-description" [innerHTML]="result.highlightedDescription || result.description"></p>
                            
                            @if (result.tags && result.tags.length > 0) {
                              <div class="result-tags">
                                @for (tag of result.tags.slice(0, 3); track tag) {
                                  <span class="result-tag">{{ tag }}</span>
                                }
                              </div>
                            }
                            
                            @if (result.author) {
                              <div class="result-author">
                                By {{ result.author }}
                              </div>
                            }
                          </div>
                        </div>
                        
                        <a [routerLink]="result.url" class="result-link">
                          View Details →
                        </a>
                      </article>
                    }
                  </div>
                } @else {
                  <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>No results found</h3>
                    <p>Try adjusting your search terms or filters</p>
                    
                    <div class="search-suggestions-help">
                      <h4>Suggestions:</h4>
                      <ul>
                        <li>Check your spelling</li>
                        <li>Try more general terms</li>
                        <li>Use different keywords</li>
                        <li>Remove some filters</li>
                      </ul>
                    </div>
                    
                    @if (popularSearches().length > 0) {
                      <div class="popular-searches">
                        <h4>Popular searches:</h4>
                        <div class="popular-search-tags">
                          @for (search of popularSearches(); track search) {
                            <button
                              type="button"
                              (click)="performSearchQuery(search)"
                              class="popular-search-tag">
                              {{ search }}
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              } @else {
                <div class="search-welcome">
                  <div class="welcome-content">
                    <h2>Discover Amazing Content</h2>
                    <p>Search through our projects, services, blog posts, and testimonials to find exactly what you're looking for.</p>
                    
                    @if (popularSearches().length > 0) {
                      <div class="popular-searches">
                        <h3>Popular searches:</h3>
                        <div class="popular-search-tags">
                          @for (search of popularSearches(); track search) {
                            <button
                              type="button"
                              (click)="performSearchQuery(search)"
                              class="popular-search-tag">
                              {{ search }}
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </main>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .search-page {
      min-height: 100vh;
      background: #F8F9FA;
    }

    /* Search Header */
    .search-header {
      background: linear-gradient(135deg, var(--theme-primary, #7FB069) 0%, var(--theme-secondary, #F7E9E3) 100%);
      padding: 3rem 0;
      color: white;
    }

    .search-header-content {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .search-header h1 {
      font-size: 3rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .search-header p {
      font-size: 1.2rem;
      margin: 0 0 2rem 0;
      opacity: 0.9;
    }

    /* Search Bar */
    .search-bar-container {
      position: relative;
      margin-bottom: 2rem;
    }

    .search-bar {
      position: relative;
      max-width: 600px;
      margin: 0 auto;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      background: white;
      border-radius: 50px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    }

    .search-bar.focused .search-input-wrapper {
      box-shadow: 0 12px 35px rgba(0,0,0,0.2);
      transform: translateY(-2px);
    }

    .search-input {
      flex: 1;
      padding: 1.25rem 1.5rem;
      border: none;
      font-size: 1.1rem;
      background: transparent;
      color: var(--theme-text, #2D3436);
    }

    .search-input:focus {
      outline: none;
    }

    .search-input::placeholder {
      color: #AAA;
    }

    .search-button {
      padding: 1.25rem 1.5rem;
      border: none;
      background: var(--theme-primary, #7FB069);
      color: white;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .search-button:hover:not(:disabled) {
      background: #6FA055;
    }

    .search-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .search-icon {
      font-size: 1.2rem;
    }

    .clear-button {
      position: absolute;
      right: 70px;
      top: 50%;
      transform: translateY(-50%);
      width: 30px;
      height: 30px;
      border: none;
      background: #F1F3F4;
      color: #666;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .clear-button:hover {
      background: #E8EAED;
    }

    /* Search Suggestions */
    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      z-index: 1000;
      max-height: 400px;
      overflow-y: auto;
      margin-top: 0.5rem;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      cursor: pointer;
      transition: background 0.2s ease;
      color: var(--theme-text, #2D3436);
    }

    .suggestion-item:hover {
      background: #F8F9FA;
    }

    .suggestion-item.loading {
      cursor: default;
      color: #666;
    }

    .suggestion-icon {
      font-size: 1rem;
      opacity: 0.7;
    }

    .suggestion-text {
      flex: 1;
      font-size: 0.95rem;
    }

    .suggestion-count {
      font-size: 0.8rem;
      color: #666;
      background: #F1F3F4;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
    }

    .suggestion-section {
      border-top: 1px solid #E9ECEF;
      padding-top: 0.5rem;
    }

    .suggestion-header {
      padding: 0.5rem 1.25rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Quick Filters */
    .quick-filters {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .filter-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border: 2px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.1);
      color: white;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .filter-chip:hover {
      background: rgba(255,255,255,0.2);
      border-color: rgba(255,255,255,0.5);
    }

    .filter-chip.active {
      background: white;
      color: var(--theme-primary, #7FB069);
      border-color: white;
    }

    .filter-icon {
      font-size: 1rem;
    }

    .filter-count {
      background: rgba(0,0,0,0.1);
      color: inherit;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .filter-chip.active .filter-count {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    /* Results Layout */
    .search-results-section {
      padding: 3rem 0;
    }

    .search-results-layout {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 3rem;
      align-items: start;
    }

    /* Sidebar */
    .search-sidebar {
      position: sticky;
      top: 2rem;
    }

    .sidebar-content {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .sidebar-content h3 {
      margin: 0 0 1.5rem 0;
      color: var(--theme-text, #2D3436);
      font-size: 1.2rem;
    }

    .filter-group {
      margin-bottom: 2rem;
    }

    .filter-group h4 {
      margin: 0 0 1rem 0;
      color: var(--theme-text, #2D3436);
      font-size: 1rem;
      font-weight: 600;
    }

    .sort-options,
    .category-filters {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .radio-option,
    .checkbox-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .radio-label,
    .checkbox-label {
      font-size: 0.95rem;
      color: var(--theme-text, #2D3436);
    }

    .clear-filters-btn {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--theme-primary, #7FB069);
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .clear-filters-btn:hover {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    /* Main Results */
    .search-main {
      min-height: 500px;
    }

    .search-results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #E9ECEF;
    }

    .results-info p {
      margin: 0;
      color: var(--theme-text, #2D3436);
      font-size: 1.1rem;
    }

    .view-toggle {
      display: flex;
      gap: 0.5rem;
    }

    .view-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #DDD;
      background: white;
      color: var(--theme-text, #2D3436);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .view-btn.active {
      background: var(--theme-primary, #7FB069);
      color: white;
      border-color: var(--theme-primary, #7FB069);
    }

    /* Search Results */
    .search-results.view-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .search-results.view-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .search-result-item {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .search-result-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .view-list .search-result-item {
      flex-direction: row;
    }

    .result-content {
      display: flex;
      flex: 1;
    }

    .view-list .result-content {
      flex: 1;
    }

    .view-grid .result-content {
      flex-direction: column;
    }

    .result-image {
      position: relative;
      flex-shrink: 0;
    }

    .view-list .result-image {
      width: 200px;
      height: 150px;
    }

    .view-grid .result-image {
      width: 100%;
      height: 200px;
    }

    .result-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .result-type-badge {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .result-info {
      padding: 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .result-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.75rem;
      font-size: 0.85rem;
      color: #666;
    }

    .result-type {
      font-weight: 600;
      color: var(--theme-primary, #7FB069);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .result-title {
      margin: 0 0 0.75rem 0;
      font-size: 1.3rem;
      line-height: 1.4;
    }

    .result-title a {
      color: var(--theme-text, #2D3436);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .result-title a:hover {
      color: var(--theme-primary, #7FB069);
    }

    .result-description {
      margin: 0 0 1rem 0;
      color: #666;
      line-height: 1.6;
      flex: 1;
    }

    .result-tags {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .result-tag {
      background: #F1F3F4;
      color: #666;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .result-author {
      font-size: 0.9rem;
      color: #666;
      font-style: italic;
    }

    .result-link {
      align-self: flex-start;
      margin-top: auto;
      color: var(--theme-primary, #7FB069);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .result-link:hover {
      color: #6FA055;
    }

    /* Search States */
    .search-loading {
      text-align: center;
      padding: 4rem 2rem;
    }

    .loading-spinner-large {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid var(--theme-primary, #7FB069);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid var(--theme-primary, #7FB069);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .no-results {
      text-align: center;
      padding: 4rem 2rem;
    }

    .no-results-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .no-results h3 {
      margin: 0 0 0.5rem 0;
      color: var(--theme-text, #2D3436);
    }

    .no-results p {
      margin: 0 0 2rem 0;
      color: #666;
    }

    .search-suggestions-help {
      background: #F8F9FA;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      text-align: left;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .search-suggestions-help h4 {
      margin: 0 0 1rem 0;
      color: var(--theme-text, #2D3436);
    }

    .search-suggestions-help ul {
      margin: 0;
      padding-left: 1.25rem;
      color: #666;
    }

    .search-suggestions-help li {
      margin-bottom: 0.5rem;
    }

    .search-welcome {
      text-align: center;
      padding: 4rem 2rem;
    }

    .welcome-content h2 {
      margin: 0 0 1rem 0;
      color: var(--theme-text, #2D3436);
      font-size: 2rem;
    }

    .welcome-content p {
      margin: 0 0 2rem 0;
      color: #666;
      font-size: 1.1rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .popular-searches {
      margin-top: 2rem;
    }

    .popular-searches h3,
    .popular-searches h4 {
      margin: 0 0 1rem 0;
      color: var(--theme-text, #2D3436);
    }

    .popular-search-tags {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .popular-search-tag {
      background: var(--theme-primary, #7FB069);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .popular-search-tag:hover {
      background: #6FA055;
      transform: translateY(-1px);
    }

    /* Highlight styles */
    :global(.search-highlight) {
      background: yellow;
      font-weight: 600;
      padding: 0.1em 0.2em;
      border-radius: 3px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .search-results-layout {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .search-sidebar {
        position: static;
        order: 2;
      }

      .sidebar-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }
    }

    @media (max-width: 768px) {
      .search-header h1 {
        font-size: 2rem;
      }

      .search-header p {
        font-size: 1rem;
      }

      .search-input {
        padding: 1rem;
        font-size: 1rem;
      }

      .search-button {
        padding: 1rem;
      }

      .quick-filters {
        gap: 0.5rem;
      }

      .filter-chip {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
      }

      .search-results.view-grid {
        grid-template-columns: 1fr;
      }

      .view-list .search-result-item {
        flex-direction: column;
      }

      .view-list .result-image {
        width: 100%;
        height: 200px;
      }

      .search-results-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .sidebar-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SearchComponent implements OnInit, OnDestroy {
  searchService = inject(SearchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // Component state
  searchFocused = signal(false);
  showSuggestions = signal(false);
  viewMode = signal<'list' | 'grid'>('list');
  hasSearched = signal(false);

  // Search input debouncing
  private searchSubject = new Subject<string>();

  // Form for search input
  searchForm = this.fb.group({
    query: ['']
  });

  // Content type configuration
  contentTypes = [
    { key: 'project', label: 'Projects', icon: '🎨' },
    { key: 'service', label: 'Services', icon: '💼' },
    { key: 'blog', label: 'Blog Posts', icon: '📝' },
    { key: 'testimonial', label: 'Testimonials', icon: '💬' }
  ] as const;

  // Sort options
  sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' }
  ] as const;

  // Available categories (would be loaded from service)
  availableCategories = ['wedding', 'corporate', 'birthday', 'anniversary', 'seasonal'];

  // Computed properties from search service
  currentQuery = this.searchService.currentQuery;
  searchResults = this.searchService.searchResults;
  searchSuggestions = this.searchService.searchSuggestions;
  selectedFilters = this.searchService.selectedFilters;
  recentSearches = this.searchService.recentSearches;
  popularSearches = this.searchService.popularSearches;
  hasResults = this.searchService.hasResults;
  resultCount = this.searchService.resultCount;
  filteredResultsByType = this.searchService.filteredResultsByType;
  isSearching = this.searchService.isSearching;

  constructor() {
    // Set up search input debouncing
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        if (query.length >= 2) {
          this.searchService.generateSuggestions(query);
        } else {
          this.searchService.searchSuggestions.set([]);
        }
      });
  }

  ngOnInit(): void {
    // Load initial search parameters from URL
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.hasSearched.set(true);
        this.performSearchQuery(params['q']);
        
        // Apply URL filters
        if (params['types']) {
          const types = params['types'].split(',');
          this.searchService.updateFilters({ contentTypes: types });
        }
        
        if (params['categories']) {
          const categories = params['categories'].split(',');
          this.searchService.updateFilters({ categories });
        }
        
        if (params['sort']) {
          this.searchService.updateFilters({ sortBy: params['sort'] });
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Search methods
  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchService.currentQuery.set(query);
    this.searchSubject.next(query);
    this.showSuggestions.set(true);
  }

  onSearchFocus(): void {
    this.searchFocused.set(true);
    this.showSuggestions.set(true);
  }

  onSearchBlur(): void {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => {
      this.searchFocused.set(false);
      this.showSuggestions.set(false);
    }, 200);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.performSearch();
    } else if (event.key === 'Escape') {
      this.showSuggestions.set(false);
    }
  }

  async performSearch(): Promise<void> {
    const query = this.currentQuery();
    if (query.trim()) {
      this.hasSearched.set(true);
      this.showSuggestions.set(false);
      await this.searchService.search(query);
      this.updateUrl();
    }
  }

  async performSearchQuery(query: string): Promise<void> {
    this.searchService.currentQuery.set(query);
    this.hasSearched.set(true);
    await this.searchService.search(query);
    this.updateUrl();
  }

  clearSearch(): void {
    this.searchService.clearSearch();
    this.hasSearched.set(false);
    this.router.navigate(['/search']);
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    this.performSearchQuery(suggestion.text);
  }

  // Filter methods
  toggleContentType(type: string): void {
    const current = this.selectedFilters().contentTypes;
    const updated = current.includes(type as any)
      ? current.filter(t => t !== type)
      : [...current, type as any];
    
    this.searchService.updateFilters({ contentTypes: updated });
    this.updateUrl();
  }

  toggleCategory(category: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedFilters().categories;
    const updated = checked
      ? [...current, category]
      : current.filter(c => c !== category);
    
    this.searchService.updateFilters({ categories: updated });
    this.updateUrl();
  }

  updateSortBy(sortBy: string): void {
    this.searchService.updateFilters({ sortBy: sortBy as any });
    this.updateUrl();
  }

  clearFilters(): void {
    this.searchService.updateFilters({
      contentTypes: ['project', 'service', 'blog', 'testimonial'],
      categories: [],
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    this.updateUrl();
  }

  hasActiveFilters(): boolean {
    const filters = this.selectedFilters();
    return filters.contentTypes.length < 4 || 
           filters.categories.length > 0 ||
           filters.sortBy !== 'relevance';
  }

  // View methods
  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode.set(mode);
  }

  // Utility methods
  getTypeLabel(type: string): string {
    const typeConfig = this.contentTypes.find(t => t.key === type);
    return typeConfig?.label || type;
  }

  getTypeCount(type: string): number {
    const results = this.filteredResultsByType();
    switch (type) {
      case 'project': return results.projects.length;
      case 'service': return results.services.length;
      case 'blog': return results.blogs.length;
      case 'testimonial': return results.testimonials.length;
      default: return 0;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private updateUrl(): void {
    const query = this.currentQuery();
    const filters = this.selectedFilters();
    
    if (!query) {
      this.router.navigate(['/search']);
      return;
    }

    const params: any = { q: query };
    
    if (filters.contentTypes.length < 4) {
      params.types = filters.contentTypes.join(',');
    }
    
    if (filters.categories.length > 0) {
      params.categories = filters.categories.join(',');
    }
    
    if (filters.sortBy !== 'relevance') {
      params.sort = filters.sortBy;
    }

    this.router.navigate(['/search'], { queryParams: params });
  }
}