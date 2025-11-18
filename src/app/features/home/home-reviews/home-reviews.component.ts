import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { ReviewService } from '../../../services/review.service';
import { Review } from '../../../models/review';
import { AuthService, UserProfile } from '../../../services/auth.service';

@Component({
  selector: 'app-home-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './home-reviews.component.html',
  styleUrl: './home-reviews.component.scss'
})
export class HomeReviewsComponent {
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private translateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  readonly stars = [1, 2, 3, 4, 5];
  readonly math = Math;

  reviews = signal<Review[]>([]);
  currentUser = signal<UserProfile | null>(null);
  userReview = signal<Review | null>(null);

  ratingInput = signal<number>(0);
  commentInput = signal<string>('');

  isSubmitting = signal<boolean>(false);
  submissionMessage = signal<string | null>(null);
  submissionError = signal<string | null>(null);

  averageRating = computed(() => {
    const list = this.reviews();
    if (!list.length) {
      return 0;
    }
    const total = list.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / list.length) * 10) / 10;
  });

  totalReviews = computed(() => this.reviews().length);

  displayedReviews = computed(() => this.reviews().slice(0, 8));

  constructor() {
    this.reviewService.getLatestReviews(16)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(reviews => {
        this.reviews.set(reviews);
      });

    this.authService.userProfile$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(profile => {
          this.currentUser.set(profile);
          this.submissionMessage.set(null);
          this.submissionError.set(null);

          if (!profile) {
            this.userReview.set(null);
            this.resetForm();
            return of(null);
          }

          return this.reviewService.getReviewByUser(profile.uid);
        })
      )
      .subscribe(review => {
        this.userReview.set(review);
        if (review) {
          this.ratingInput.set(review.rating);
          this.commentInput.set(review.comment);
        } else {
          this.resetForm();
        }
      });
  }

  selectRating(value: number) {
    if (this.isSubmitting()) {
      return;
    }
    this.ratingInput.set(value);
  }

  async submitReview() {
    const user = this.currentUser();
    if (!user) {
      this.submissionError.set(this.translateService.instant('home.reviews.errors.sign_in_required'));
      return;
    }

    const rating = this.ratingInput();
    const comment = this.commentInput().trim();

    if (!rating || rating < 1) {
      this.submissionError.set(this.translateService.instant('home.reviews.errors.rating_required'));
      return;
    }

    if (comment.length < 10) {
      this.submissionError.set(this.translateService.instant('home.reviews.errors.comment_too_short'));
      return;
    }

    this.isSubmitting.set(true);
    this.submissionError.set(null);
    try {
      await this.reviewService.saveReview({
        uid: user.uid,
        displayName: user.displayName || user.email || 'Anonymous Miner',
        rating,
        comment,
        photoURL: null
      });

      const updatedReview: Review = {
        id: user.uid,
        uid: user.uid,
        displayName: user.displayName || user.email || 'Anonymous Miner',
        rating,
        comment,
        photoURL: null,
        updatedAt: new Date()
      };

      this.userReview.set(updatedReview);

      const currentList = this.reviews();
      const existingIndex = currentList.findIndex(r => r.uid === user.uid);
      if (existingIndex >= 0) {
        currentList[existingIndex] = {
          ...currentList[existingIndex],
          rating,
          comment,
          displayName: updatedReview.displayName,
          updatedAt: new Date()
        };
        this.reviews.set([...currentList]);
      } else {
        this.reviews.set([updatedReview, ...currentList].slice(0, 16));
      }

      this.submissionMessage.set(this.translateService.instant('home.reviews.success.saved'));
    } catch (error: any) {
      console.error('Error saving review:', error);
      this.submissionError.set(error?.message || this.translateService.instant('home.reviews.errors.save_failed'));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteReview() {
    const user = this.currentUser();
    if (!user || !this.userReview()) {
      return;
    }

    const confirmed = typeof window !== 'undefined'
      ? window.confirm(this.translateService.instant('home.reviews.delete_confirm'))
      : true;

    if (!confirmed) {
      return;
    }

    this.isSubmitting.set(true);
    this.submissionError.set(null);

    try {
      await this.reviewService.deleteReview(user.uid);

      const filtered = this.reviews().filter(review => review.uid !== user.uid);
      this.reviews.set(filtered);
      this.userReview.set(null);
      this.resetForm();
      this.submissionMessage.set(this.translateService.instant('home.reviews.success.deleted'));
    } catch (error: any) {
      console.error('Error deleting review:', error);
      this.submissionError.set(error?.message || this.translateService.instant('home.reviews.errors.delete_failed'));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  trackByReviewId(_: number, review: Review) {
    return review.id;
  }

  getStarClass(star: number, value: number): string {
    return star <= Math.round(value) ? 'text-bitcoin-gold' : 'text-white/20';
  }

  private resetForm() {
    this.ratingInput.set(0);
    this.commentInput.set('');
  }
}
