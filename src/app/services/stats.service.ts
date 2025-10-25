import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, query, where, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable, from, map, catchError, of } from 'rxjs';

export interface SiteStats {
  totalSales: number;
  customerSatisfaction: number;
  uptimeGuarantee: number;
  yearsExperience: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private firestore = inject(Firestore);
  
  // Company founding date
  private readonly FOUNDING_DATE = new Date('2024-06-01');

  /**
   * Get all site statistics
   * First tries to get from a public stats document, falls back to calculating
   */
  getStats(): Observable<SiteStats> {
    return from(this.fetchStats()).pipe(
      catchError(error => {
        console.error('Error fetching stats:', error);
        return of(this.getDefaultStats());
      })
    );
  }

  private async fetchStats(): Promise<SiteStats> {
    // Try to get pre-calculated stats from a public document
    // This should be updated by a Cloud Function or admin action
    try {
      const statsDocRef = doc(this.firestore, 'settings/public');
      const statsDoc = await getDoc(statsDocRef);
      
      if (statsDoc.exists()) {
        const data = statsDoc.data();
        if (data['stats']) {
          return {
            totalSales: data['stats'].totalSales || 0,
            customerSatisfaction: data['stats'].customerSatisfaction || 98,
            uptimeGuarantee: data['stats'].uptimeGuarantee || 99.9,
            yearsExperience: this.calculateYearsExperience()
          };
        }
      }
    } catch (error) {
      console.log('Stats not found in public settings, using defaults');
    }

    // If no pre-calculated stats, try to fetch from surveys (public read)
    const customerSatisfaction = await this.getCustomerSatisfaction();

    return {
      totalSales: 0, // Will be updated via admin or Cloud Function
      customerSatisfaction,
      uptimeGuarantee: 99.9,
      yearsExperience: this.calculateYearsExperience()
    };
  }

  /**
   * Get average customer satisfaction from surveys
   * Assumes you have a 'surveys' collection with a 'rating' field (1-100 or 1-5 scale)
   */
  private async getCustomerSatisfaction(): Promise<number> {
    try {
      const surveysRef = collection(this.firestore, 'surveys');
      const snapshot = await getDocs(surveysRef);
      
      if (snapshot.empty) {
        // Default to 98% if no surveys yet
        console.log('No surveys found, using default satisfaction rating');
        return 98;
      }

      let totalRating = 0;
      let count = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data['rating']) {
          // If rating is 1-5, convert to percentage
          const rating = data['rating'];
          const normalizedRating = rating <= 5 ? (rating / 5) * 100 : rating;
          totalRating += normalizedRating;
          count++;
        }
      });

      if (count === 0) {
        return 98;
      }

      return Math.round(totalRating / count);
    } catch (error: any) {
      // If surveys collection doesn't exist or permission denied, use default
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        console.log('Surveys collection not accessible, using default satisfaction rating');
      } else {
        console.log('Error fetching customer satisfaction, using default:', error);
      }
      return 98;
    }
  }

  /**
   * Calculate years of experience since founding
   * Returns decimal with 1 year minimum
   */
  private calculateYearsExperience(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.FOUNDING_DATE.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    // Always show at least 1 year, round to 1 decimal
    return Math.max(1, Math.round(diffYears * 10) / 10);
  }

  /**
   * Get default stats if database fetch fails
   */
  private getDefaultStats(): SiteStats {
    return {
      totalSales: 0,
      customerSatisfaction: 98,
      uptimeGuarantee: 99.9,
      yearsExperience: this.calculateYearsExperience()
    };
  }

  /**
   * Admin function to update stats in settings/public document
   * This should be called from admin dashboard
   */
  async updatePublicStats(totalSales?: number): Promise<void> {
    try {
      const publicSettingsRef = doc(this.firestore, 'settings/public');
      
      // Get current customer satisfaction from surveys
      const customerSatisfaction = await this.getCustomerSatisfaction();
      
      // If totalSales not provided, try to count completed orders
      let sales = totalSales;
      if (sales === undefined) {
        try {
          const ordersRef = collection(this.firestore, 'orders');
          const completedOrdersQuery = query(
            ordersRef,
            where('status', 'in', ['shipped', 'delivered', 'completed'])
          );
          const ordersSnapshot = await getDocs(completedOrdersQuery);
          sales = ordersSnapshot.size;
          console.log(`Found ${sales} completed orders`);
        } catch (error: any) {
          if (error?.code === 'permission-denied') {
            console.log('No permission to read orders (expected for non-admin), using 0');
          } else {
            console.log('Could not count orders, using 0:', error);
          }
          sales = 0;
        }
      }

      // Get existing settings first
      const existingDoc = await getDoc(publicSettingsRef);
      const existingData = existingDoc.exists() ? existingDoc.data() : {};

      // Update with new stats
      await setDoc(publicSettingsRef, {
        ...existingData,
        stats: {
          totalSales: sales,
          customerSatisfaction,
          uptimeGuarantee: 99.9,
          lastUpdated: new Date().toISOString()
        }
      }, { merge: true });

      console.log('✅ Stats updated successfully!', {
        totalSales: sales,
        customerSatisfaction,
        uptimeGuarantee: 99.9
      });
    } catch (error) {
      console.error('❌ Error updating public stats:', error);
      throw error;
    }
  }
}
