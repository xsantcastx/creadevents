import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';
import { FirestoreService } from '../../services/firestore.service';
import { BlogPost, Project, Service, Testimonial } from '../../models/data.models';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  lastLogin?: Date;
}

interface DashboardStats {
  totalProjects: number;
  totalServices: number;
  totalTestimonials: number;
  totalBlogPosts: number;
  recentInquiries: number;
  monthlyViews: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-dashboard">
      
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <div class="brand">
            <h1>Creation Design & Events</h1>
            <span class="admin-label">Admin Dashboard</span>
          </div>
          <div class="user-actions">
            <span class="welcome-text">Welcome, {{ currentUser()?.name || 'Admin' }}</span>
            <button (click)="logout()" class="btn btn-outline">Logout</button>
          </div>
        </div>
      </header>

      <!-- Auth Screen -->
      @if (!isAuthenticated()) {
        <div class="auth-screen">
          <div class="auth-container">
            <div class="auth-card">
              <h2>Admin Login</h2>
              <form [formGroup]="loginForm" (ngSubmit)="login()">
                <div class="form-group">
                  <label for="email">Email Address</label>
                  <input 
                    id="email"
                    type="email" 
                    formControlName="email"
                    placeholder="admin@creadevents.com">
                  @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                    <span class="error-message">Valid email is required</span>
                  }
                </div>
                
                <div class="form-group">
                  <label for="password">Password</label>
                  <input 
                    id="password"
                    type="password" 
                    formControlName="password"
                    placeholder="Enter your password">
                  @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                    <span class="error-message">Password is required</span>
                  }
                </div>

                @if (loginError()) {
                  <div class="error-alert">
                    {{ loginError() }}
                  </div>
                }
                
                <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || isLoggingIn()">
                  @if (isLoggingIn()) {
                    Logging in...
                  } @else {
                    Login
                  }
                </button>
              </form>
              
              <div class="demo-credentials">
                <p><strong>Demo Credentials:</strong></p>
                <p>Email: admin@creadevents.com</p>
                <p>Password: admin123</p>
              </div>
            </div>
          </div>
        </div>
      } @else {
        
        <!-- Main Dashboard -->
        <main class="dashboard-main">
          <div class="container">
            
            <!-- Stats Overview -->
            <section class="stats-section">
              <h2>Dashboard Overview</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">📁</div>
                  <div class="stat-content">
                    <h3>{{ dashboardStats().totalProjects }}</h3>
                    <p>Total Projects</p>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">⚙️</div>
                  <div class="stat-content">
                    <h3>{{ dashboardStats().totalServices }}</h3>
                    <p>Active Services</p>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">💬</div>
                  <div class="stat-content">
                    <h3>{{ dashboardStats().totalTestimonials }}</h3>
                    <p>Testimonials</p>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">📝</div>
                  <div class="stat-content">
                    <h3>{{ dashboardStats().totalBlogPosts }}</h3>
                    <p>Blog Posts</p>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">📧</div>
                  <div class="stat-content">
                    <h3>{{ dashboardStats().recentInquiries }}</h3>
                    <p>New Inquiries</p>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">👁️</div>
                  <div class="stat-content">
                    <h3>{{ formatNumber(dashboardStats().monthlyViews) }}</h3>
                    <p>Monthly Views</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Quick Actions -->
            <section class="quick-actions">
              <h2>Quick Actions</h2>
              <div class="actions-grid">
                <button (click)="setActiveTab('projects')" class="action-card">
                  <div class="action-icon">➕</div>
                  <h3>Add Project</h3>
                  <p>Create a new portfolio project</p>
                </button>
                
                <button (click)="setActiveTab('services')" class="action-card">
                  <div class="action-icon">🛠️</div>
                  <h3>Manage Services</h3>
                  <p>Update service offerings</p>
                </button>
                
                <button (click)="setActiveTab('blog')" class="action-card">
                  <div class="action-icon">✍️</div>
                  <h3>Write Blog Post</h3>
                  <p>Share insights and tips</p>
                </button>
                
                <button (click)="setActiveTab('seasonal')" class="action-card">
                  <div class="action-icon">🎨</div>
                  <h3>Update Seasonal Theme</h3>
                  <p>Change website appearance</p>
                </button>
              </div>
            </section>

            <!-- Content Management Tabs -->
            <section class="content-management">
              <div class="tab-navigation">
                <button 
                  *ngFor="let tab of tabs" 
                  (click)="setActiveTab(tab.id)"
                  [class.active]="activeTab() === tab.id"
                  class="tab-btn">
                  {{ tab.label }}
                </button>
              </div>

              <div class="tab-content">
                
                <!-- Projects Tab -->
                @if (activeTab() === 'projects') {
                  <div class="tab-panel">
                    <div class="panel-header">
                      <h3>Project Management</h3>
                      <button (click)="showProjectForm = !showProjectForm" class="btn btn-primary">
                        {{ showProjectForm ? 'Cancel' : 'Add New Project' }}
                      </button>
                    </div>

                    @if (showProjectForm) {
                      <div class="form-container">
                        <form [formGroup]="projectForm" (ngSubmit)="saveProject()">
                          <div class="form-row">
                            <div class="form-group">
                              <label for="projectTitle">Project Title</label>
                              <input id="projectTitle" type="text" formControlName="title" placeholder="Beautiful Spring Wedding">
                            </div>
                            
                            <div class="form-group">
                              <label for="projectSlug">URL Slug</label>
                              <input id="projectSlug" type="text" formControlName="slug" placeholder="beautiful-spring-wedding">
                            </div>
                          </div>
                          
                          <div class="form-group">
                            <label for="projectDescription">Description</label>
                            <textarea id="projectDescription" formControlName="description" rows="4" 
                              placeholder="Describe this beautiful project..."></textarea>
                          </div>
                          
                          <div class="form-row">
                            <div class="form-group">
                              <label for="projectClient">Client Name</label>
                              <input id="projectClient" type="text" formControlName="client" placeholder="Sarah & Michael">
                            </div>
                            
                            <div class="form-group">
                              <label for="projectDate">Event Date</label>
                              <input id="projectDate" type="date" formControlName="eventDate">
                            </div>
                          </div>
                          
                          <div class="form-group">
                            <label for="projectImages">Image URLs (one per line)</label>
                            <textarea id="projectImages" formControlName="imageUrls" rows="4" 
                              placeholder="/assets/project1-main.jpg&#10;/assets/project1-detail.jpg"></textarea>
                          </div>
                          
                          <div class="form-actions">
                            <button type="submit" class="btn btn-primary" [disabled]="projectForm.invalid">
                              Save Project
                            </button>
                            <button type="button" (click)="resetProjectForm()" class="btn btn-outline">
                              Reset Form
                            </button>
                          </div>
                        </form>
                      </div>
                    }

                    <div class="data-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Client</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (project of projects(); track project.id) {
                            <tr>
                              <td>{{ project.title }}</td>
                              <td>{{ project.client || 'N/A' }}</td>
                              <td>{{ formatDate(project.eventDate || project.date) }}</td>
                              <td>
                                <span class="status-badge published">Published</span>
                              </td>
                              <td>
                                <div class="action-buttons">
                                  <button (click)="editProject(project)" class="btn-small btn-outline">Edit</button>
                                  <button (click)="deleteProject(project.id!)" class="btn-small btn-danger">Delete</button>
                                </div>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                }

                <!-- Services Tab -->
                @if (activeTab() === 'services') {
                  <div class="tab-panel">
                    <div class="panel-header">
                      <h3>Service Management</h3>
                      <button (click)="showServiceForm = !showServiceForm" class="btn btn-primary">
                        {{ showServiceForm ? 'Cancel' : 'Add New Service' }}
                      </button>
                    </div>

                    @if (showServiceForm) {
                      <div class="form-container">
                        <form [formGroup]="serviceForm" (ngSubmit)="saveService()">
                          <div class="form-row">
                            <div class="form-group">
                              <label for="serviceName">Service Name</label>
                              <input id="serviceName" type="text" formControlName="name" placeholder="Wedding Florals">
                            </div>
                            
                            <div class="form-group">
                              <label for="servicePrice">Starting Price</label>
                              <input id="servicePrice" type="text" formControlName="price" placeholder="$500+">
                            </div>
                          </div>
                          
                          <div class="form-group">
                            <label for="serviceDescription">Description</label>
                            <textarea id="serviceDescription" formControlName="description" rows="4" 
                              placeholder="Complete floral design for your special day..."></textarea>
                          </div>
                          
                          <div class="form-group">
                            <label for="serviceFeatures">Features (one per line)</label>
                            <textarea id="serviceFeatures" formControlName="features" rows="4" 
                              placeholder="Bridal bouquet&#10;Ceremony arrangements&#10;Reception centerpieces"></textarea>
                          </div>
                          
                          <div class="form-actions">
                            <button type="submit" class="btn btn-primary" [disabled]="serviceForm.invalid">
                              Save Service
                            </button>
                            <button type="button" (click)="resetServiceForm()" class="btn btn-outline">
                              Reset Form
                            </button>
                          </div>
                        </form>
                      </div>
                    }

                    <div class="services-grid">
                      @for (service of services(); track service.id) {
                        <div class="service-card">
                          <h4>{{ service.name || service.title }}</h4>
                          <p class="service-price">{{ service.price || 'Contact for pricing' }}</p>
                          <p class="service-description">{{ service.description || service.summary }}</p>
                          <div class="service-actions">
                            <button (click)="editService(service)" class="btn-small btn-outline">Edit</button>
                            <button (click)="deleteService(service.id!)" class="btn-small btn-danger">Delete</button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Blog Tab -->
                @if (activeTab() === 'blog') {
                  <div class="tab-panel">
                    <div class="panel-header">
                      <h3>Blog Management</h3>
                      <button (click)="showBlogForm = !showBlogForm" class="btn btn-primary">
                        {{ showBlogForm ? 'Cancel' : 'Write New Post' }}
                      </button>
                    </div>

                    @if (showBlogForm) {
                      <div class="form-container">
                        <form [formGroup]="blogForm" (ngSubmit)="saveBlogPost()">
                          <div class="form-group">
                            <label for="blogTitle">Post Title</label>
                            <input id="blogTitle" type="text" formControlName="title" 
                              placeholder="Summer Wedding Trends 2024">
                          </div>
                          
                          <div class="form-row">
                            <div class="form-group">
                              <label for="blogSlug">URL Slug</label>
                              <input id="blogSlug" type="text" formControlName="slug" 
                                placeholder="summer-wedding-trends-2024">
                            </div>
                            
                            <div class="form-group">
                              <label for="blogCategory">Category</label>
                              <select id="blogCategory" formControlName="category">
                                <option value="trends">Trends</option>
                                <option value="tips">Tips & Advice</option>
                                <option value="behind-scenes">Behind the Scenes</option>
                                <option value="venue-spotlight">Venue Spotlight</option>
                                <option value="seasonal">Seasonal</option>
                              </select>
                            </div>
                          </div>
                          
                          <div class="form-group">
                            <label for="blogExcerpt">Excerpt</label>
                            <textarea id="blogExcerpt" formControlName="excerpt" rows="3" 
                              placeholder="A brief summary of your post..."></textarea>
                          </div>
                          
                          <div class="form-group">
                            <label for="blogContent">Content</label>
                            <textarea id="blogContent" formControlName="content" rows="10" 
                              placeholder="Write your blog post content here..."></textarea>
                          </div>
                          
                          <div class="form-row">
                            <div class="form-group">
                              <label for="blogImage">Cover Image URL</label>
                              <input id="blogImage" type="url" formControlName="coverImage" 
                                placeholder="/assets/blog-cover.jpg">
                            </div>
                            
                            <div class="form-group checkbox-group">
                              <label>
                                <input type="checkbox" formControlName="featured">
                                Featured Post
                              </label>
                            </div>
                          </div>
                          
                          <div class="form-actions">
                            <button type="submit" class="btn btn-primary" [disabled]="blogForm.invalid">
                              Publish Post
                            </button>
                            <button type="button" (click)="resetBlogForm()" class="btn btn-outline">
                              Reset Form
                            </button>
                          </div>
                        </form>
                      </div>
                    }

                    <div class="blog-list">
                      @for (post of blogPosts(); track post.id) {
                        <div class="blog-item">
                          <div class="blog-meta">
                            <h4>{{ post.title }}</h4>
                            <div class="blog-details">
                              <span class="blog-date">{{ formatDate(post.createdAt!) }}</span>
                              @if (post.featured) {
                                <span class="featured-badge">Featured</span>
                              }
                            </div>
                          </div>
                          <div class="blog-actions">
                            <button (click)="editBlogPost(post)" class="btn-small btn-outline">Edit</button>
                            <button (click)="deleteBlogPost(post.id!)" class="btn-small btn-danger">Delete</button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Seasonal Theme Tab -->
                @if (activeTab() === 'seasonal') {
                  <div class="tab-panel">
                    <div class="panel-header">
                      <h3>Seasonal Theme Management</h3>
                      <p>Update the website's seasonal appearance and content</p>
                    </div>

                    <div class="seasonal-controls">
                      <div class="current-season">
                        <h4>Current Season: {{ getCurrentSeason() }}</h4>
                        <p>The website is currently displaying {{ getCurrentSeason().toLowerCase() }} themes and colors.</p>
                      </div>

                      <div class="season-selector">
                        <h4>Change Season Theme</h4>
                        <div class="season-buttons">
                          @for (season of seasons; track season) {
                            <button 
                              (click)="updateSeasonalTheme(season)"
                              [class.active]="getCurrentSeason().toLowerCase() === season"
                              class="season-btn">
                              {{ getSeasonEmoji(season) }} {{ season | titlecase }}
                            </button>
                          }
                        </div>
                      </div>

                      <div class="theme-preview">
                        <h4>Theme Preview</h4>
                        <div class="color-palette">
                          <div class="color-swatch primary" [style.background-color]="getThemeColor('primary')">
                            <span>Primary</span>
                          </div>
                          <div class="color-swatch secondary" [style.background-color]="getThemeColor('secondary')">
                            <span>Secondary</span>
                          </div>
                          <div class="color-swatch accent" [style.background-color]="getThemeColor('accent')">
                            <span>Accent</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </section>
          </div>
        </main>
      }
    </div>
  `,
  styles: [`
    .admin-dashboard {
      min-height: 100vh;
      background: #F8F9FA;
    }

    /* Auth Screen */
    .auth-screen {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--theme-primary, #7FB069) 0%, var(--theme-secondary, #F7E9E3) 100%);
    }

    .auth-container {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
    }

    .auth-card {
      background: white;
      padding: 3rem;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .auth-card h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: var(--theme-text, #2D3436);
    }

    .demo-credentials {
      background: #F8F9FA;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1.5rem;
      font-size: 0.9rem;
    }

    .demo-credentials p {
      margin: 0.25rem 0;
    }

    /* Header */
    .dashboard-header {
      background: white;
      border-bottom: 1px solid #E9ECEF;
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand h1 {
      color: var(--theme-primary, #7FB069);
      margin: 0;
      font-size: 1.5rem;
    }

    .admin-label {
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
    }

    .user-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .welcome-text {
      color: var(--theme-text, #2D3436);
      font-weight: 500;
    }

    /* Main Dashboard */
    .dashboard-main {
      padding: 2rem 0;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* Stats Section */
    .stats-section {
      margin-bottom: 3rem;
    }

    .stats-section h2 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .stat-icon {
      font-size: 2rem;
      background: var(--theme-secondary, #F7E9E3);
      padding: 1rem;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-content h3 {
      font-size: 2rem;
      margin: 0;
      color: var(--theme-primary, #7FB069);
      font-weight: 700;
    }

    .stat-content p {
      margin: 0.5rem 0 0 0;
      color: var(--theme-text-secondary, #636E72);
      font-weight: 500;
    }

    /* Quick Actions */
    .quick-actions {
      margin-bottom: 3rem;
    }

    .quick-actions h2 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 1.5rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      text-align: center;
      border: none;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .action-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .action-card h3 {
      color: var(--theme-text, #2D3436);
      margin: 0 0 0.5rem 0;
    }

    .action-card p {
      color: var(--theme-text-secondary, #636E72);
      margin: 0;
    }

    /* Content Management */
    .content-management {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      overflow: hidden;
    }

    .tab-navigation {
      display: flex;
      border-bottom: 1px solid #E9ECEF;
      background: #F8F9FA;
    }

    .tab-btn {
      padding: 1rem 2rem;
      border: none;
      background: transparent;
      color: var(--theme-text-secondary, #636E72);
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
      border-bottom: 3px solid transparent;
    }

    .tab-btn:hover {
      background: white;
    }

    .tab-btn.active {
      color: var(--theme-primary, #7FB069);
      background: white;
      border-bottom-color: var(--theme-primary, #7FB069);
    }

    .tab-content {
      padding: 2rem;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .panel-header h3 {
      color: var(--theme-text, #2D3436);
      margin: 0;
    }

    /* Forms */
    .form-container {
      background: #F8F9FA;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--theme-text, #2D3436);
      font-weight: 500;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #E9ECEF;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--theme-primary, #7FB069);
    }

    .checkbox-group {
      display: flex;
      align-items: center;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .error-message {
      color: #DC3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: block;
    }

    .error-alert {
      background: #F8D7DA;
      color: #721C24;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    /* Buttons */
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      text-decoration: none;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-block;
      text-align: center;
    }

    .btn-primary {
      background: var(--theme-primary, #7FB069);
      color: white;
      border-color: var(--theme-primary, #7FB069);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--theme-primary-dark, #6A9B56);
      border-color: var(--theme-primary-dark, #6A9B56);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-outline {
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border-color: var(--theme-primary, #7FB069);
    }

    .btn-outline:hover {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .btn-small {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn-danger {
      background: #DC3545;
      color: white;
      border-color: #DC3545;
    }

    .btn-danger:hover {
      background: #C82333;
      border-color: #C82333;
    }

    /* Data Tables */
    .data-table {
      background: #F8F9FA;
      border-radius: 8px;
      overflow: hidden;
    }

    .data-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th,
    .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #E9ECEF;
    }

    .data-table th {
      background: var(--theme-primary, #7FB069);
      color: white;
      font-weight: 600;
    }

    .data-table tbody tr:hover {
      background: white;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-badge.published {
      background: #D4EDDA;
      color: #155724;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    /* Services Grid */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .service-card {
      background: #F8F9FA;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #E9ECEF;
    }

    .service-card h4 {
      color: var(--theme-text, #2D3436);
      margin: 0 0 0.5rem 0;
    }

    .service-price {
      color: var(--theme-primary, #7FB069);
      font-weight: 600;
      font-size: 1.1rem;
      margin: 0 0 1rem 0;
    }

    .service-description {
      color: var(--theme-text-secondary, #636E72);
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }

    .service-actions {
      display: flex;
      gap: 0.5rem;
    }

    /* Blog List */
    .blog-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .blog-item {
      background: #F8F9FA;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #E9ECEF;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .blog-meta h4 {
      color: var(--theme-text, #2D3436);
      margin: 0 0 0.5rem 0;
    }

    .blog-details {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .blog-date {
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
    }

    .featured-badge {
      background: var(--theme-accent, #FFEAA7);
      color: var(--theme-text, #2D3436);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .blog-actions {
      display: flex;
      gap: 0.5rem;
    }

    /* Seasonal Theme Controls */
    .seasonal-controls {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .current-season,
    .season-selector,
    .theme-preview {
      background: #F8F9FA;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .current-season h4,
    .season-selector h4,
    .theme-preview h4 {
      color: var(--theme-text, #2D3436);
      margin: 0 0 1rem 0;
    }

    .season-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .season-btn {
      padding: 1rem 1.5rem;
      border: 2px solid #E9ECEF;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 1rem;
    }

    .season-btn:hover {
      border-color: var(--theme-primary, #7FB069);
    }

    .season-btn.active {
      background: var(--theme-primary, #7FB069);
      color: white;
      border-color: var(--theme-primary, #7FB069);
    }

    .color-palette {
      display: flex;
      gap: 1rem;
    }

    .color-swatch {
      width: 100px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 500;
      font-size: 0.9rem;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .stats-grid,
      .actions-grid {
        grid-template-columns: 1fr;
      }

      .tab-navigation {
        flex-wrap: wrap;
      }

      .tab-btn {
        flex: 1;
        min-width: 150px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .panel-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .data-table {
        overflow-x: auto;
      }

      .blog-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .season-buttons {
        justify-content: center;
      }

      .color-palette {
        justify-content: center;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);

  // Authentication state
  isAuthenticated = signal(false);
  currentUser = signal<AdminUser | null>(null);
  isLoggingIn = signal(false);
  loginError = signal<string | null>(null);

  // Forms
  loginForm: FormGroup;
  projectForm: FormGroup;
  serviceForm: FormGroup;
  blogForm: FormGroup;

  // UI state
  activeTab = signal('projects');
  showProjectForm = false;
  showServiceForm = false;
  showBlogForm = false;

  // Data
  projects = signal<Project[]>([]);
  services = signal<Service[]>([]);
  blogPosts = signal<BlogPost[]>([]);
  testimonials = signal<Testimonial[]>([]);

  // Dashboard stats
  dashboardStats = computed(() => ({
    totalProjects: this.projects().length,
    totalServices: this.services().length,
    totalTestimonials: this.testimonials().length,
    totalBlogPosts: this.blogPosts().length,
    recentInquiries: 12,
    monthlyViews: 8450
  }));

  // Tab configuration
  tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'services', label: 'Services' },
    { id: 'blog', label: 'Blog Posts' },
    { id: 'seasonal', label: 'Seasonal Themes' }
  ];

  seasons = ['spring', 'summer', 'fall', 'winter'];

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      slug: ['', Validators.required],
      description: ['', Validators.required],
      client: ['', Validators.required],
      eventDate: ['', Validators.required],
      imageUrls: ['']
    });

    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      description: ['', Validators.required],
      features: ['']
    });

    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      slug: ['', Validators.required],
      excerpt: ['', Validators.required],
      content: ['', Validators.required],
      category: ['trends', Validators.required],
      coverImage: ['', Validators.required],
      featured: [false]
    });
  }

  ngOnInit(): void {
    this.loadSampleData();
  }

  // Authentication methods
  login(): void {
    if (this.loginForm.invalid) return;

    this.isLoggingIn.set(true);
    this.loginError.set(null);

    const { email, password } = this.loginForm.value;

    // Demo authentication
    setTimeout(() => {
      if (email === 'admin@creadevents.com' && password === 'admin123') {
        this.isAuthenticated.set(true);
        this.currentUser.set({
          id: '1',
          email: 'admin@creadevents.com',
          name: 'Admin User',
          role: 'admin',
          lastLogin: new Date()
        });
        this.seasonalThemeService.applyThemeToDocument();
      } else {
        this.loginError.set('Invalid email or password. Please use the demo credentials.');
      }
      this.isLoggingIn.set(false);
    }, 1000);
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.loginForm.reset();
  }

  // Navigation methods
  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
    this.showProjectForm = false;
    this.showServiceForm = false;
    this.showBlogForm = false;
  }

  // Project methods
  saveProject(): void {
    if (this.projectForm.invalid) return;

    const formValue = this.projectForm.value;
    const newProject: Project = {
      id: Date.now().toString(),
      title: formValue.title,
      slug: formValue.slug,
      description: formValue.description,
      client: formValue.client,
      eventType: 'wedding',
      season: ['spring'],
      palette: [],
      location: 'Miami, FL',
      date: new Date(formValue.eventDate),
      eventDate: new Date(formValue.eventDate),
      heroImage: formValue.imageUrls.split('\n')[0] || '/assets/default-project.jpg',
      gallery: formValue.imageUrls.split('\n').filter((url: string) => url.trim()),
      imageUrls: formValue.imageUrls.split('\n').filter((url: string) => url.trim()),
      category: 'wedding',
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.projects.set([...this.projects(), newProject]);
    this.resetProjectForm();
    this.showProjectForm = false;
  }

  editProject(project: Project): void {
    this.projectForm.patchValue({
      title: project.title,
      slug: project.slug,
      description: project.description,
      client: project.client || '',
      eventDate: (project.eventDate || project.date).toISOString().split('T')[0],
      imageUrls: (project.imageUrls || project.gallery || []).join('\n')
    });
    this.showProjectForm = true;
  }

  deleteProject(projectId: string): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projects.set(this.projects().filter(p => p.id !== projectId));
    }
  }

  resetProjectForm(): void {
    this.projectForm.reset();
  }

  // Service methods
  saveService(): void {
    if (this.serviceForm.invalid) return;

    const formValue = this.serviceForm.value;
    const newService: Service = {
      id: Date.now().toString(),
      title: formValue.name,
      name: formValue.name,
      slug: formValue.name.toLowerCase().replace(/\s+/g, '-'),
      summary: formValue.description,
      description: formValue.description,
      price: formValue.price,
      inclusions: formValue.features.split('\n').filter((feature: string) => feature.trim()),
      features: formValue.features.split('\n').filter((feature: string) => feature.trim()),
      minBudget: 500,
      images: ['/assets/service-default.jpg'],
      imageUrl: '/assets/service-default.jpg',
      category: 'wedding',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.services.set([...this.services(), newService]);
    this.resetServiceForm();
    this.showServiceForm = false;
  }

  editService(service: Service): void {
    this.serviceForm.patchValue({
      name: service.name || service.title,
      price: service.price || '$500+',
      description: service.description || service.summary,
      features: (service.features || service.inclusions || []).join('\n')
    });
    this.showServiceForm = true;
  }

  deleteService(serviceId: string): void {
    if (confirm('Are you sure you want to delete this service?')) {
      this.services.set(this.services().filter(s => s.id !== serviceId));
    }
  }

  resetServiceForm(): void {
    this.serviceForm.reset();
  }

  // Blog methods
  saveBlogPost(): void {
    if (this.blogForm.invalid) return;

    const formValue = this.blogForm.value;
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: formValue.title,
      slug: formValue.slug,
      excerpt: formValue.excerpt,
      body: formValue.content,
      coverImage: formValue.coverImage,
      tags: [formValue.category],
      featured: formValue.featured,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.blogPosts.set([...this.blogPosts(), newPost]);
    this.resetBlogForm();
    this.showBlogForm = false;
  }

  editBlogPost(post: BlogPost): void {
    this.blogForm.patchValue({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.body,
      category: post.tags[0] || 'trends',
      coverImage: post.coverImage,
      featured: post.featured
    });
    this.showBlogForm = true;
  }

  deleteBlogPost(postId: string): void {
    if (confirm('Are you sure you want to delete this blog post?')) {
      this.blogPosts.set(this.blogPosts().filter(p => p.id !== postId));
    }
  }

  resetBlogForm(): void {
    this.blogForm.reset({
      category: 'trends',
      featured: false
    });
  }

  // Seasonal theme methods
  getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }

  updateSeasonalTheme(season: string): void {
    this.seasonalThemeService.setCurrentSeason(season as any);
    this.seasonalThemeService.applyThemeToDocument();
  }

  getSeasonEmoji(season: string): string {
    const emojis: { [key: string]: string } = {
      spring: '🌸',
      summer: '☀️',
      fall: '🍂',
      winter: '❄️'
    };
    return emojis[season] || '🌸';
  }

  getThemeColor(type: 'primary' | 'secondary' | 'accent'): string {
    const season = this.getCurrentSeason().toLowerCase();
    const themes = this.seasonalThemeService.getSeasonalThemes();
    const seasonTheme = themes[season as keyof typeof themes];
    return seasonTheme?.palette?.[type] || '#7FB069';
  }

  // Utility methods
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  private loadSampleData(): void {
    // Sample projects
    this.projects.set([
      {
        id: '1',
        title: 'Elegant Spring Wedding',
        slug: 'elegant-spring-wedding',
        description: 'A beautiful spring wedding with pastel florals and garden-inspired arrangements.',
        client: 'Sarah & Michael',
        eventType: 'wedding',
        season: ['spring'],
        palette: ['#F0F5F2', '#5E8A75', '#F5D0C5'],
        location: 'Miami Beach, FL',
        date: new Date('2024-04-15'),
        eventDate: new Date('2024-04-15'),
        heroImage: '/assets/fb_4888_8929514942_2_48x2_48.jpg',
        gallery: ['/assets/fb_4888_8929514942_2_48x2_48.jpg'],
        imageUrls: ['/assets/fb_4888_8929514942_2_48x2_48.jpg'],
        category: 'wedding',
        featured: true,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01')
      }
    ]);

    // Sample services
    this.services.set([
      {
        id: '1',
        title: 'Wedding Florals',
        name: 'Wedding Florals',
        slug: 'wedding-florals',
        summary: 'Complete floral design for your special day including bridal bouquet, ceremony arrangements, and reception centerpieces.',
        description: 'Complete floral design for your special day including bridal bouquet, ceremony arrangements, and reception centerpieces.',
        price: '$500+',
        inclusions: ['Bridal bouquet', 'Ceremony arrangements', 'Reception centerpieces', 'Consultation'],
        features: ['Bridal bouquet', 'Ceremony arrangements', 'Reception centerpieces', 'Consultation'],
        minBudget: 500,
        images: ['/assets/service-wedding.jpg'],
        imageUrl: '/assets/service-wedding.jpg',
        category: 'wedding',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Sample blog posts
    this.blogPosts.set([
      {
        id: '1',
        title: 'Spring Wedding Trends 2024',
        slug: 'spring-wedding-trends-2024',
        excerpt: 'Discover the hottest spring wedding trends for 2024.',
        body: 'Spring weddings are experiencing a renaissance of natural beauty...',
        coverImage: '/assets/blog-spring-trends.jpg',
        tags: ['trends', 'seasonal'],
        featured: true,
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15')
      }
    ]);
  }
}