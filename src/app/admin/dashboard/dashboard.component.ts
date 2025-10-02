import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';
import { AuthService, UserProfile } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { FileUploadComponent } from '../../shared/file-upload/file-upload.component';
import { BlogPost, Project, Service, Testimonial } from '../../models/data.models';

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
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent],
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
            <span class="welcome-text">Welcome, {{ authService.currentUser()?.displayName || authService.currentUser()?.email || 'Admin' }}</span>
            <button (click)="logout()" class="btn btn-outline">Logout</button>
          </div>
        </div>
      </header>

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
                
                <button (click)="navigateToAnalytics()" class="action-card">
                  <div class="action-icon">📊</div>
                  <h3>View Analytics</h3>
                  <p>Monitor website performance</p>
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

                <!-- Overview Tab -->
                @if (activeTab() === 'overview') {
                  <div class="tab-panel">
                    <div class="overview-grid">
                      <div class="quick-stats">
                        <h3>Quick Stats</h3>
                        <div class="stats-cards">
                          <div class="stat-card">
                            <div class="stat-number">{{ dashboardStats().totalProjects }}</div>
                            <div class="stat-label">Projects</div>
                            <div class="stat-change">+2 this month</div>
                          </div>
                          <div class="stat-card">
                            <div class="stat-number">{{ dashboardStats().totalServices }}</div>
                            <div class="stat-label">Services</div>
                            <div class="stat-change">Active</div>
                          </div>
                          <div class="stat-card">
                            <div class="stat-number">{{ dashboardStats().recentInquiries }}</div>
                            <div class="stat-label">New Inquiries</div>
                            <div class="stat-change">This week</div>
                          </div>
                        </div>
                      </div>

                      <div class="recent-activity">
                        <h3>Recent Activity</h3>
                        <div class="activity-list">
                          <div class="activity-item">
                            <div class="activity-icon">📁</div>
                            <div class="activity-content">
                              <div class="activity-title">New project added</div>
                              <div class="activity-time">2 hours ago</div>
                            </div>
                          </div>
                          <div class="activity-item">
                            <div class="activity-icon">📧</div>
                            <div class="activity-content">
                              <div class="activity-title">Contact form submission</div>
                              <div class="activity-time">4 hours ago</div>
                            </div>
                          </div>
                          <div class="activity-item">
                            <div class="activity-icon">📝</div>
                            <div class="activity-content">
                              <div class="activity-title">Blog post published</div>
                              <div class="activity-time">1 day ago</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- Testimonials Tab -->
                @if (activeTab() === 'testimonials') {
                  <div class="tab-panel">
                    <div class="panel-header">
                      <h3>Testimonials Management</h3>
                      <button (click)="showTestimonialForm = !showTestimonialForm" class="btn btn-primary">
                        {{ showTestimonialForm ? 'Cancel' : 'Add New Testimonial' }}
                      </button>
                    </div>

                    @if (showTestimonialForm) {
                      <div class="form-container">
                        <form [formGroup]="testimonialForm" (ngSubmit)="saveTestimonial()">
                          <div class="form-row">
                            <div class="form-group">
                              <label for="testimonialAuthor">Client Name</label>
                              <input id="testimonialAuthor" type="text" formControlName="author" placeholder="Maria Rodriguez">
                            </div>
                            
                            <div class="form-group">
                              <label for="testimonialEvent">Event Type</label>
                              <input id="testimonialEvent" type="text" formControlName="event" placeholder="Wedding Reception">
                            </div>
                          </div>
                          
                          <div class="form-group">
                            <label for="testimonialQuote">Testimonial Quote</label>
                            <textarea id="testimonialQuote" formControlName="quote" rows="4" 
                              placeholder="Share their amazing experience..."></textarea>
                          </div>
                          
                          <div class="form-row">
                            <div class="form-group">
                              <label for="testimonialRating">Rating (1-5)</label>
                              <select id="testimonialRating" formControlName="rating">
                                <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                                <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                                <option value="3">⭐⭐⭐ (3 Stars)</option>
                                <option value="2">⭐⭐ (2 Stars)</option>
                                <option value="1">⭐ (1 Star)</option>
                              </select>
                            </div>
                            
                            <div class="form-group">
                              <label>
                                <input type="checkbox" formControlName="featured">
                                Featured Testimonial
                              </label>
                            </div>
                          </div>
                          
                          <div class="form-actions">
                            <button type="submit" class="btn btn-primary" [disabled]="testimonialForm.invalid">
                              Save Testimonial
                            </button>
                            <button type="button" (click)="resetTestimonialForm()" class="btn btn-outline">
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
                            <th>Client</th>
                            <th>Event</th>
                            <th>Rating</th>
                            <th>Featured</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (testimonial of testimonials(); track testimonial.id) {
                            <tr>
                              <td>{{ testimonial.author }}</td>
                              <td>{{ testimonial.event || 'N/A' }}</td>
                              <td>
                                <div class="rating-display">
                                  @for (star of getStars(testimonial.rating || 5); track star) {
                                    <span>⭐</span>
                                  }
                                </div>
                              </td>
                              <td>
                                <span class="status-badge" [class.featured]="testimonial.featured">
                                  {{ testimonial.featured ? 'Featured' : 'Regular' }}
                                </span>
                              </td>
                              <td>
                                <div class="action-buttons">
                                  <button (click)="editTestimonial(testimonial)" class="btn-small btn-outline">Edit</button>
                                  <button (click)="deleteTestimonial(testimonial.id!)" class="btn-small btn-danger">Delete</button>
                                </div>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                }

                <!-- Inquiries Tab -->
                @if (activeTab() === 'inquiries') {
                  <div class="tab-panel">
                    <div class="panel-header">
                      <h3>Customer Inquiries</h3>
                      <div class="inquiry-filters">
                        <select (change)="filterInquiries($event)">
                          <option value="all">All Inquiries</option>
                          <option value="new">New</option>
                          <option value="responded">Responded</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div class="inquiries-list">
                      @for (inquiry of filteredInquiries(); track inquiry.id) {
                        <div class="inquiry-card" [class.unread]="!inquiry.responded">
                          <div class="inquiry-header">
                            <div class="client-info">
                              <h4>{{ inquiry.fullName }}</h4>
                              <p>{{ inquiry.email }} • {{ inquiry.phone }}</p>
                            </div>
                            <div class="inquiry-meta">
                              <div class="inquiry-date">{{ formatDate(inquiry.createdAt!) }}</div>
                              <div class="inquiry-status" [class.responded]="inquiry.responded">
                                {{ inquiry.responded ? 'Responded' : 'New' }}
                              </div>
                            </div>
                          </div>
                          
                          <div class="inquiry-details">
                            <div class="event-info">
                              <strong>Event:</strong> {{ inquiry.eventDate }} • {{ inquiry.guestCount }} guests
                              <br>
                              <strong>Budget:</strong> {{ inquiry.budgetRange }}
                              <br>
                              <strong>Venue:</strong> {{ inquiry.venue }}, {{ inquiry.city }}
                            </div>
                            
                            @if (inquiry.notes) {
                              <div class="inquiry-notes">
                                <strong>Notes:</strong> {{ inquiry.notes }}
                              </div>
                            }
                          </div>
                          
                          <div class="inquiry-actions">
                            <button (click)="respondToInquiry(inquiry)" class="btn-small btn-primary">
                              {{ inquiry.responded ? 'Update Response' : 'Respond' }}
                            </button>
                            <button (click)="archiveInquiry(inquiry)" class="btn-small btn-outline">Archive</button>
                            <button (click)="deleteInquiry(inquiry.id!)" class="btn-small btn-danger">Delete</button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- File Manager Tab -->
                @if (activeTab() === 'files') {
                  <div class="tab-panel">
                    <div class="panel-header">
                      <h3>File Manager</h3>
                      <div class="file-actions">
                        <button (click)="refreshFileList()" class="btn btn-outline">Refresh</button>
                        <button (click)="showUploadModal = !showUploadModal" class="btn btn-primary">
                          {{ showUploadModal ? 'Hide Upload' : 'Upload Files' }}
                        </button>
                      </div>
                    </div>

                    @if (showUploadModal) {
                      <div class="upload-section">
                        <app-file-upload
                          title="Upload New Files"
                          description="Upload images for projects, blog posts, and other content"
                          [multiple]="true"
                          category="general"
                          (filesUploaded)="onFilesUploaded($event)"
                          (uploadError)="onUploadError($event)">
                        </app-file-upload>
                      </div>
                    }

                    <div class="file-browser">
                      <div class="file-categories">
                        <button 
                          *ngFor="let category of fileCategories" 
                          (click)="setFileCategory(category)"
                          [class.active]="selectedFileCategory() === category"
                          class="category-btn">
                          {{ category | titlecase }}
                        </button>
                      </div>

                      @if (isLoadingFiles()) {
                        <div class="loading-files">
                          <p>Loading files...</p>
                        </div>
                      } @else {
                        <div class="files-grid">
                          @for (file of filteredFiles(); track file.fullPath) {
                            <div class="file-item">
                              @if (isImageFile(file.name)) {
                                <div class="file-preview">
                                  <img [src]="file.url" [alt]="file.name" loading="lazy">
                                </div>
                              } @else {
                                <div class="file-icon">📄</div>
                              }
                              
                              <div class="file-info">
                                <div class="file-name">{{ file.name }}</div>
                                <div class="file-size">{{ formatFileSize(file.size) }}</div>
                                <div class="file-date">{{ formatFileDate(file.timeCreated) }}</div>
                              </div>
                              
                              <div class="file-actions">
                                <button (click)="copyFileUrl(file.url)" class="btn-small btn-outline">Copy URL</button>
                                <button (click)="deleteFile(file)" class="btn-small btn-danger">Delete</button>
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- User Management Tab -->
                @if (activeTab() === 'users') {
                  <div class="tab-panel">
                    <div class="panel-header">
                      <h3>User Management</h3>
                      <div class="user-actions">
                        <button (click)="loadUsers()" class="btn btn-outline" [disabled]="isLoadingUsers()">
                          {{ isLoadingUsers() ? 'Loading...' : 'Refresh Users' }}
                        </button>
                      </div>
                    </div>

                    @if (isLoadingUsers()) {
                      <div class="loading-users">
                        <p>Loading users...</p>
                      </div>
                    } @else {
                      <div class="users-table">
                        <div class="table-container">
                          <table>
                            <thead>
                              <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Created</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for (user of allUsers(); track user.uid) {
                                <tr>
                                  <td>
                                    <div class="user-info">
                                      @if (user.photoURL) {
                                        <img [src]="user.photoURL" [alt]="user.displayName" class="user-avatar">
                                      } @else {
                                        <div class="user-avatar-placeholder">
                                          {{ (user.displayName || user.email)[0].toUpperCase() }}
                                        </div>
                                      }
                                      <div class="user-details">
                                        <div class="user-name">{{ user.displayName || 'No name' }}</div>
                                        <div class="user-id">ID: {{ user.uid.substring(0, 8) }}...</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td>{{ user.email }}</td>
                                  <td>
                                    <span class="role-badge" [class]="getUserRoleBadgeClass(user.role)">
                                      {{ user.role }}
                                    </span>
                                  </td>
                                  <td>
                                    <span class="status-badge" [class.active]="user.isActive">
                                      {{ user.isActive ? 'Active' : 'Inactive' }}
                                    </span>
                                  </td>
                                  <td>{{ formatLastLogin(user.lastLoginAt) }}</td>
                                  <td>{{ user.createdAt.toLocaleDateString() }}</td>
                                  <td>
                                    <div class="user-actions-cell">
                                      <select 
                                        [value]="user.role" 
                                        (change)="updateUserRole(user, $any($event.target).value)"
                                        class="role-select">
                                        <option value="user">User</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                      </select>
                                      <button 
                                        (click)="toggleUserStatus(user)" 
                                        class="btn-small"
                                        [class.btn-danger]="user.isActive"
                                        [class.btn-success]="!user.isActive">
                                        {{ user.isActive ? 'Deactivate' : 'Activate' }}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              }
                              @empty {
                                <tr>
                                  <td colspan="7" class="empty-state">
                                    <p>No users found. Users will appear here after they register.</p>
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div class="user-permissions-info">
                        <h4>Permission Levels</h4>
                        <div class="permissions-grid">
                          <div class="permission-card">
                            <h5>👑 Admin</h5>
                            <ul>
                              <li>✅ Full content management</li>
                              <li>✅ User management</li>
                              <li>✅ Analytics & reporting</li>
                              <li>✅ File management</li>
                              <li>✅ Seasonal themes</li>
                              <li>✅ Data export</li>
                            </ul>
                          </div>
                          <div class="permission-card">
                            <h5>✏️ Editor</h5>
                            <ul>
                              <li>✅ Content management</li>
                              <li>👁️ View users only</li>
                              <li>✅ View analytics</li>
                              <li>✅ Upload files</li>
                              <li>❌ Seasonal themes</li>
                              <li>❌ Data export</li>
                            </ul>
                          </div>
                          <div class="permission-card">
                            <h5>👤 User</h5>
                            <ul>
                              <li>❌ No content management</li>
                              <li>❌ No user access</li>
                              <li>❌ No analytics</li>
                              <li>❌ No file upload</li>
                              <li>❌ No admin features</li>
                              <li>👁️ Public content only</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- Analytics Tab -->
                @if (activeTab() === 'analytics') {
                  <div class="tab-panel">
                    <div class="panel-header">
                      <h3>Website Analytics</h3>
                      <div class="analytics-period">
                        <select (change)="setAnalyticsPeriod($event)">
                          <option value="7">Last 7 days</option>
                          <option value="30">Last 30 days</option>
                          <option value="90">Last 3 months</option>
                        </select>
                      </div>
                    </div>

                    <div class="analytics-grid">
                      <div class="analytics-card">
                        <h4>Page Views</h4>
                        <div class="metric-value">{{ analyticsData().pageViews || 'N/A' }}</div>
                        <div class="metric-change positive">+12% vs last period</div>
                      </div>
                      
                      <div class="analytics-card">
                        <h4>Unique Visitors</h4>
                        <div class="metric-value">{{ analyticsData().uniqueVisitors || 'N/A' }}</div>
                        <div class="metric-change positive">+8% vs last period</div>
                      </div>
                      
                      <div class="analytics-card">
                        <h4>Contact Form Submissions</h4>
                        <div class="metric-value">{{ analyticsData().contactSubmissions || dashboardStats().recentInquiries }}</div>
                        <div class="metric-change positive">+25% vs last period</div>
                      </div>
                      
                      <div class="analytics-card">
                        <h4>Avg. Session Duration</h4>
                        <div class="metric-value">{{ analyticsData().avgSessionDuration || '2m 45s' }}</div>
                        <div class="metric-change negative">-5% vs last period</div>
                      </div>
                    </div>

                    <div class="popular-pages">
                      <h4>Most Popular Pages</h4>
                      <div class="pages-list">
                        <div class="page-item">
                          <span class="page-path">/services</span>
                          <span class="page-views">1,234 views</span>
                        </div>
                        <div class="page-item">
                          <span class="page-path">/portfolio</span>
                          <span class="page-views">987 views</span>
                        </div>
                        <div class="page-item">
                          <span class="page-path">/contact</span>
                          <span class="page-views">756 views</span>
                        </div>
                        <div class="page-item">
                          <span class="page-path">/blog</span>
                          <span class="page-views">543 views</span>
                        </div>
                      </div>
                    </div>

                    <div class="analytics-note">
                      <p><strong>Note:</strong> Connect Google Analytics for detailed insights. Analytics data is currently simulated for demo purposes.</p>
                    </div>
                  </div>
                }
              </div>
            </section>
          </div>
        </main>
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

    /* Buttons - using shared styles */

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

    /* Admin-specific mobile styles */
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

    /* Overview Tab Styles */
    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .quick-stats .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: var(--theme-primary, #7FB069);
    }

    .stat-label {
      color: var(--theme-text-secondary, #636E72);
      margin-top: 0.5rem;
    }

    .stat-change {
      font-size: 0.85rem;
      color: #28A745;
      margin-top: 0.25rem;
    }

    .recent-activity {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .activity-list {
      margin-top: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #F1F3F4;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      font-size: 1.5rem;
    }

    .activity-title {
      font-weight: 500;
      color: var(--theme-text, #2D3436);
    }

    .activity-time {
      font-size: 0.85rem;
      color: var(--theme-text-secondary, #636E72);
    }

    /* Inquiries Tab Styles */
    .inquiry-filters {
      display: flex;
      gap: 1rem;
    }

    .inquiry-filters select {
      padding: 0.5rem;
      border: 1px solid #DDD;
      border-radius: 6px;
      background: white;
    }

    .inquiries-list {
      margin-top: 1.5rem;
    }

    .inquiry-card {
      background: white;
      border: 1px solid #E9ECEF;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }

    .inquiry-card.unread {
      border-left: 4px solid var(--theme-primary, #7FB069);
      background: #F8FFF9;
    }

    .inquiry-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .inquiry-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .client-info h4 {
      margin: 0 0 0.25rem 0;
      color: var(--theme-text, #2D3436);
    }

    .client-info p {
      margin: 0;
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
    }

    .inquiry-meta {
      text-align: right;
    }

    .inquiry-date {
      font-size: 0.85rem;
      color: var(--theme-text-secondary, #636E72);
    }

    .inquiry-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-top: 0.5rem;
      background: #FEF3C7;
      color: #92400E;
    }

    .inquiry-status.responded {
      background: #D1FAE5;
      color: #065F46;
    }

    .inquiry-details {
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    .event-info {
      background: #F8F9FA;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }

    .inquiry-notes {
      font-style: italic;
      color: var(--theme-text-secondary, #636E72);
    }

    .inquiry-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    /* File Manager Tab Styles */
    .file-actions {
      display: flex;
      gap: 1rem;
    }

    .upload-section {
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .file-browser {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .file-categories {
      display: flex;
      background: #F8F9FA;
      border-bottom: 1px solid #E9ECEF;
    }

    .category-btn {
      padding: 1rem 1.5rem;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .category-btn.active {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .category-btn:hover {
      background: rgba(127, 176, 105, 0.1);
    }

    .loading-files {
      padding: 3rem;
      text-align: center;
      color: var(--theme-text-secondary, #636E72);
    }

    .files-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      padding: 1.5rem;
    }

    .file-item {
      border: 1px solid #E9ECEF;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .file-item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .file-preview {
      height: 150px;
      overflow: hidden;
      background: #F8F9FA;
    }

    .file-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .file-icon {
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      background: #F8F9FA;
    }

    .file-info {
      padding: 1rem;
    }

    .file-name {
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--theme-text, #2D3436);
      word-break: break-word;
    }

    .file-size, .file-date {
      font-size: 0.85rem;
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 0.25rem;
    }

    .file-actions {
      padding: 0 1rem 1rem;
      display: flex;
      gap: 0.5rem;
    }

    /* Analytics Tab Styles */
    .analytics-period {
      display: flex;
      gap: 1rem;
    }

    .analytics-period select {
      padding: 0.5rem;
      border: 1px solid #DDD;
      border-radius: 6px;
      background: white;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin: 1.5rem 0;
    }

    .analytics-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }

    .analytics-card h4 {
      margin: 0 0 1rem 0;
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--theme-primary, #7FB069);
      margin-bottom: 0.5rem;
    }

    .metric-change {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .metric-change.positive {
      color: #28A745;
    }

    .metric-change.negative {
      color: #DC3545;
    }

    .popular-pages {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-top: 1.5rem;
    }

    .popular-pages h4 {
      margin: 0 0 1rem 0;
      color: var(--theme-text, #2D3436);
    }

    .pages-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .page-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #F8F9FA;
      border-radius: 8px;
    }

    .page-path {
      font-family: monospace;
      color: var(--theme-text, #2D3436);
      font-weight: 500;
    }

    .page-views {
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
    }

    .analytics-note {
      background: #FEF3C7;
      border: 1px solid #FCD34D;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1.5rem;
    }

    .analytics-note p {
      margin: 0;
      color: #92400E;
    }

    /* Rating Display */
    .rating-display {
      display: flex;
      gap: 0.1rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      background: #E5E7EB;
      color: #6B7280;
    }

    .status-badge.featured {
      background: #FCD34D;
      color: #92400E;
    }

    /* User Management Styles */
    .user-actions {
      display: flex;
      gap: 1rem;
    }

    .loading-users {
      padding: 3rem;
      text-align: center;
      color: var(--theme-text-secondary, #636E72);
    }

    .users-table {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .users-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table th,
    .users-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #E9ECEF;
    }

    .users-table th {
      background: var(--theme-primary, #7FB069);
      color: white;
      font-weight: 600;
      position: sticky;
      top: 0;
    }

    .users-table tbody tr:hover {
      background: #F8F9FA;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-avatar-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--theme-primary, #7FB069);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .user-details {
      min-width: 0;
    }

    .user-name {
      font-weight: 500;
      color: var(--theme-text, #2D3436);
    }

    .user-id {
      font-size: 0.8rem;
      color: var(--theme-text-secondary, #636E72);
      font-family: monospace;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-badge.role-admin {
      background: #DC3545;
      color: white;
    }

    .role-badge.role-editor {
      background: #FFC107;
      color: #212529;
    }

    .role-badge.role-user {
      background: #6C757D;
      color: white;
    }

    .status-badge.active {
      background: #28A745;
      color: white;
    }

    .user-actions-cell {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .role-select {
      padding: 0.25rem 0.5rem;
      border: 1px solid #DDD;
      border-radius: 4px;
      font-size: 0.85rem;
      background: white;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--theme-text-secondary, #636E72);
    }

    .user-permissions-info {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .user-permissions-info h4 {
      margin: 0 0 1rem 0;
      color: var(--theme-text, #2D3436);
    }

    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .permission-card {
      background: #F8F9FA;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #E9ECEF;
    }

    .permission-card h5 {
      margin: 0 0 0.75rem 0;
      color: var(--theme-text, #2D3436);
      font-size: 0.9rem;
    }

    .permission-card ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .permission-card li {
      padding: 0.25rem 0;
      font-size: 0.85rem;
      color: var(--theme-text-secondary, #636E72);
    }

    /* Responsive for new tabs */
    @media (max-width: 768px) {
      .overview-grid {
        grid-template-columns: 1fr;
      }

      .inquiry-header {
        flex-direction: column;
        gap: 1rem;
      }

      .inquiry-meta {
        text-align: left;
      }

      .files-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }

      .analytics-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .inquiry-actions, .file-actions, .analytics-period {
        flex-wrap: wrap;
      }

      .user-actions-cell {
        flex-direction: column;
        gap: 0.25rem;
        align-items: stretch;
      }

      .permissions-grid {
        grid-template-columns: 1fr;
      }

      .users-table th,
      .users-table td {
        padding: 0.5rem;
        font-size: 0.85rem;
      }

      .user-info {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);
  private storageService = inject(StorageService);
  private analyticsService = inject(AnalyticsService);
  protected authService = inject(AuthService);

  // Forms
  projectForm: FormGroup;
  serviceForm: FormGroup;
  blogForm: FormGroup;
  testimonialForm: FormGroup;

  // UI state
  activeTab = signal('overview');
  
  // File upload properties
  selectedFiles: FileList | null = null;
  uploadProgress = signal(0);
  isUploading = signal(false);
  uploadedImageUrls = signal<string[]>([]);
  uploadError = signal<string | null>(null);
  showProjectForm = false;
  showServiceForm = false;
  showBlogForm = false;
  showTestimonialForm = false;
  showUploadModal = false;

  // Data
  projects = signal<Project[]>([]);
  services = signal<Service[]>([]);
  blogPosts = signal<BlogPost[]>([]);
  testimonials = signal<Testimonial[]>([]);
  allUsers = signal<UserProfile[]>([]);
  isLoadingUsers = signal(false);
  selectedUser = signal<UserProfile | null>(null);

  // Dashboard stats
  dashboardStats = computed(() => ({
    totalProjects: this.projects().length,
    totalServices: this.services().length,
    totalTestimonials: this.testimonials().length,
    totalBlogPosts: this.blogPosts().length,
    recentInquiries: 12,
    monthlyViews: 8450
  }));

  // File management
  isLoadingFiles = signal(false);
  uploadedFiles = signal<any[]>([]);
  selectedFileCategory = signal('all');
  fileCategories = ['all', 'projects', 'blog', 'general'];
  
  // Inquiries management
  inquiries = signal<any[]>([
    {
      id: '1',
      fullName: 'Maria Rodriguez',
      email: 'maria@example.com',
      phone: '555-0123',
      eventDate: '2024-06-15',
      guestCount: 100,
      budgetRange: '$5,000 - $10,000',
      venue: 'Garden Paradise',
      city: 'Miami',
      notes: 'Looking for elegant outdoor wedding setup',
      createdAt: new Date('2024-01-15'),
      responded: false
    },
    {
      id: '2',
      fullName: 'John Smith',
      email: 'john@example.com',
      phone: '555-0456',
      eventDate: '2024-07-20',
      guestCount: 75,
      budgetRange: '$3,000 - $5,000',
      venue: 'City Hall',
      city: 'Tampa',
      notes: 'Corporate event with professional catering',
      createdAt: new Date('2024-01-10'),
      responded: true
    }
  ]);
  
  inquiryFilter = signal('all');
  
  filteredInquiries = computed(() => {
    const filter = this.inquiryFilter();
    if (filter === 'all') return this.inquiries();
    if (filter === 'new') return this.inquiries().filter(i => !i.responded);
    if (filter === 'responded') return this.inquiries().filter(i => i.responded);
    return this.inquiries();
  });

  // Analytics
  analyticsData = signal({
    pageViews: 12450,
    uniqueVisitors: 8320,
    contactSubmissions: 24,
    avgSessionDuration: '2m 45s'
  });

  filteredFiles = computed(() => {
    const category = this.selectedFileCategory();
    if (category === 'all') return this.uploadedFiles();
    return this.uploadedFiles().filter(file => file.category === category);
  });

  // Tab configuration
  tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects' },
    { id: 'services', label: 'Services' },
    { id: 'blog', label: 'Blog Posts' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'inquiries', label: 'Inquiries' },
    { id: 'users', label: 'User Management' },
    { id: 'files', label: 'File Manager' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'seasonal', label: 'Seasonal Themes' }
  ];

  seasons = ['spring', 'summer', 'fall', 'winter'];

  constructor() {
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

    this.testimonialForm = this.fb.group({
      author: ['', Validators.required],
      event: [''],
      quote: ['', Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      featured: [false]
    });
  }

  ngOnInit(): void {
    this.loadSampleData();
    this.loadTestimonials();
    this.loadUsers();
  }

  // User Management methods
  async loadUsers(): Promise<void> {
    if (!this.authService.canManageUsers()) {
      return;
    }
    
    this.isLoadingUsers.set(true);
    try {
      const users = await this.authService.getAllUsers();
      this.allUsers.set(users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.isLoadingUsers.set(false);
    }
  }

  async updateUserRole(user: UserProfile, newRole: 'admin' | 'editor' | 'user'): Promise<void> {
    if (!this.authService.canManageUsers()) {
      alert('You do not have permission to manage users');
      return;
    }

    try {
      await this.authService.updateUserRole(user.uid, newRole);
      await this.loadUsers(); // Refresh the list
      alert(`Successfully updated ${user.displayName || user.email} to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  }

  async toggleUserStatus(user: UserProfile): Promise<void> {
    // Implementation would go here for activating/deactivating users
    console.log('Toggle user status for:', user.email);
  }

  getUserRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'editor': return 'role-editor';
      default: return 'role-user';
    }
  }

  formatLastLogin(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour(s) ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} day(s) ago`;
    return date.toLocaleDateString();
  }

  // Authentication methods
  async logout(): Promise<void> {
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Navigation methods
  navigateToAnalytics(): void {
    this.router.navigate(['/admin/analytics']);
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
        heroImage: '/assets/logo1.jpg',
        gallery: ['/assets/logo1.jpg'],
        imageUrls: ['/assets/logo1.jpg'],
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

  // Testimonial management methods
  saveTestimonial(): void {
    if (this.testimonialForm.valid) {
      const testimonialData = this.testimonialForm.value;
      const testimonial: Testimonial = {
        ...testimonialData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.firestoreService.addTestimonial(testimonial).subscribe({
        next: () => {
          this.loadTestimonials();
          this.resetTestimonialForm();
          this.showTestimonialForm = false;
        },
        error: (error) => console.error('Error saving testimonial:', error)
      });
    }
  }

  resetTestimonialForm(): void {
    this.testimonialForm.reset({
      author: '',
      event: '',
      quote: '',
      rating: 5,
      featured: false
    });
  }

  editTestimonial(testimonial: Testimonial): void {
    this.testimonialForm.patchValue({
      author: testimonial.author,
      event: testimonial.event || '',
      quote: testimonial.quote,
      rating: testimonial.rating || 5,
      featured: testimonial.featured || false
    });
    this.showTestimonialForm = true;
  }

  deleteTestimonial(id: string): void {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      this.firestoreService.deleteTestimonial(id).subscribe({
        next: () => this.loadTestimonials(),
        error: (error) => console.error('Error deleting testimonial:', error)
      });
    }
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  // Load testimonials from Firestore
  private loadTestimonials(): void {
    this.firestoreService.getTestimonials().subscribe({
      next: (testimonials) => this.testimonials.set(testimonials),
      error: (error) => console.error('Error loading testimonials:', error)
    });
  }

  // Inquiries management methods
  filterInquiries(event: any): void {
    this.inquiryFilter.set(event.target.value);
  }

  respondToInquiry(inquiry: any): void {
    // In a real app, this would open a response modal or navigate to a detailed view
    inquiry.responded = true;
    console.log('Responding to inquiry:', inquiry);
  }

  archiveInquiry(inquiry: any): void {
    inquiry.archived = true;
    console.log('Archived inquiry:', inquiry);
  }

  deleteInquiry(id: string): void {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      const inquiries = this.inquiries().filter(i => i.id !== id);
      this.inquiries.set(inquiries);
    }
  }

  // File management methods
  refreshFileList(): void {
    this.isLoadingFiles.set(true);
    this.storageService.listFiles().then((files) => {
      this.uploadedFiles.set(files);
      this.isLoadingFiles.set(false);
    }).catch((error) => {
      console.error('Error loading files:', error);
      this.isLoadingFiles.set(false);
    });
  }

  setFileCategory(category: string): void {
    this.selectedFileCategory.set(category);
  }

  onFilesUploaded(files: any[]): void {
    console.log('Files uploaded:', files);
    this.refreshFileList();
    this.showUploadModal = false;
  }

  onUploadError(error: string): void {
    console.error('Upload error:', error);
  }

  isImageFile(fileName: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatFileDate(timeCreated: string): string {
    return this.formatDate(new Date(timeCreated));
  }

  copyFileUrl(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      console.log('URL copied to clipboard');
    });
  }

  deleteFile(file: any): void {
    if (confirm('Are you sure you want to delete this file?')) {
      this.storageService.deleteFile(file.fullPath).subscribe({
        next: () => {
          console.log('File deleted successfully');
          this.refreshFileList();
        },
        error: (error: any) => {
          console.error('Error deleting file:', error);
        }
      });
    }
  }

  // Analytics methods
  setAnalyticsPeriod(event: any): void {
    const period = event.target.value;
    console.log('Analytics period changed to:', period);
    // In a real app, this would fetch new analytics data
  }
}