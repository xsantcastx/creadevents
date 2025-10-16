import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  collectionData, 
  docData, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { Address } from '../models/cart';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  /**
   * Get all addresses for the current user
   */
  getUserAddresses(uid?: string): Observable<Address[]> {
    const userId = uid || this.auth.currentUser?.uid;
    if (!userId) {
      return of([]);
    }

    const addressesRef = collection(this.firestore, `users/${userId}/addresses`);
    return collectionData(addressesRef, { idField: 'id' }) as Observable<Address[]>;
  }

  /**
   * Get a specific address by ID
   */
  getAddress(addressId: string, uid?: string): Observable<Address | undefined> {
    const userId = uid || this.auth.currentUser?.uid;
    if (!userId) {
      return of(undefined);
    }

    const addressRef = doc(this.firestore, `users/${userId}/addresses/${addressId}`);
    return docData(addressRef, { idField: 'id' }) as Observable<Address>;
  }

  /**
   * Get the default address for a user
   */
  getDefaultAddress(uid?: string): Observable<Address | undefined> {
    const userId = uid || this.auth.currentUser?.uid;
    if (!userId) {
      return of(undefined);
    }

    // For now, just get the first address marked as default
    // In a real app, you'd query where isDefault == true
    return new Observable(observer => {
      this.getUserAddresses(userId).subscribe(addresses => {
        const defaultAddr = addresses.find(addr => addr.isDefault);
        observer.next(defaultAddr);
        observer.complete();
      });
    });
  }

  /**
   * Create a new address
   */
  async createAddress(address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be authenticated to create an address');
    }

    const addressesRef = collection(this.firestore, `users/${userId}/addresses`);
    
    const newAddress: Partial<Address> = {
      ...address,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // If this is set as default, unset all other defaults first
    if (address.isDefault) {
      await this.unsetAllDefaults(userId);
    }

    const docRef = await addDoc(addressesRef, newAddress);
    return docRef.id;
  }

  /**
   * Update an existing address
   */
  async updateAddress(addressId: string, updates: Partial<Address>): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be authenticated to update an address');
    }

    const addressRef = doc(this.firestore, `users/${userId}/addresses/${addressId}`);
    
    // If setting as default, unset all other defaults first
    if (updates.isDefault) {
      await this.unsetAllDefaults(userId, addressId);
    }

    await updateDoc(addressRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Delete an address
   */
  async deleteAddress(addressId: string): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be authenticated to delete an address');
    }

    const addressRef = doc(this.firestore, `users/${userId}/addresses/${addressId}`);
    await deleteDoc(addressRef);
  }

  /**
   * Set an address as the default
   */
  async setAsDefault(addressId: string): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be authenticated');
    }

    // First, unset all other defaults
    await this.unsetAllDefaults(userId, addressId);

    // Then set this one as default
    const addressRef = doc(this.firestore, `users/${userId}/addresses/${addressId}`);
    await updateDoc(addressRef, {
      isDefault: true,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Unset all default addresses (except optionally one to keep)
   */
  private async unsetAllDefaults(userId: string, exceptId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getUserAddresses(userId).subscribe({
        next: async (addresses) => {
          if (!addresses || addresses.length === 0) {
            resolve();
            return;
          }

          const updatePromises = addresses
            .filter(addr => addr.isDefault && addr.id !== exceptId)
            .map(addr => {
              const addressRef = doc(this.firestore, `users/${userId}/addresses/${addr.id}`);
              return updateDoc(addressRef, { isDefault: false });
            });

          try {
            await Promise.all(updatePromises);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        error: (err) => reject(err)
      });
    });
  }

  /**
   * Validate address data
   */
  validateAddress(address: Partial<Address>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!address.firstName?.trim()) {
      errors.push('First name is required');
    }

    if (!address.lastName?.trim()) {
      errors.push('Last name is required');
    }

    if (!address.line1?.trim()) {
      errors.push('Address line 1 is required');
    }

    if (!address.city?.trim()) {
      errors.push('City is required');
    }

    if (!address.region?.trim()) {
      errors.push('State/Province/Region is required');
    }

    if (!address.postalCode?.trim()) {
      errors.push('Postal code is required');
    }

    if (!address.country?.trim()) {
      errors.push('Country is required');
    }

    if (!address.phoneE164?.trim()) {
      errors.push('Phone number is required');
    } else if (!address.phoneE164.match(/^\+[1-9]\d{1,14}$/)) {
      errors.push('Phone number must be in E.164 format (e.g., +14155551234)');
    }

    if (!address.email?.trim()) {
      errors.push('Email is required');
    } else if (!address.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push('Email must be valid');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
