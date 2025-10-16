import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable, from } from 'rxjs';

export interface Address {
  country: string;
  region: string;
  postalCode: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: string;
  estimatedDays: string;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
}

export interface RepriceResponse {
  success: boolean;
  shippingMethods: ShippingMethod[];
  totals: CartTotals;
}

/**
 * Service to calculate shipping costs and taxes via Cloud Function
 */
@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  private functions = inject(Functions);

  /**
   * Calculate shipping methods and totals for a cart
   * @param cartId - Cart document ID
   * @param address - Shipping address (at minimum country, region, postalCode)
   * @returns Observable of shipping methods and updated totals
   */
  calculateShipping(cartId: string, address: Address): Observable<RepriceResponse> {
    const callable = httpsCallable<{ cartId: string; address: Address }, RepriceResponse>(
      this.functions,
      'cartReprice'
    );

    return from(callable({ cartId, address }).then(result => result.data));
  }

  /**
   * Select a shipping method and update cart totals
   * @param cartId - Cart document ID
   * @param address - Shipping address
   * @param shippingMethodId - Selected shipping method ID ('standard' or 'express')
   * @returns Observable of updated totals
   */
  selectShippingMethod(
    cartId: string, 
    address: Address, 
    shippingMethodId: string
  ): Observable<RepriceResponse> {
    const callable = httpsCallable<
      { cartId: string; address: Address; shippingMethodId: string }, 
      RepriceResponse
    >(
      this.functions,
      'cartReprice'
    );

    return from(callable({ cartId, address, shippingMethodId }).then(result => result.data));
  }

  /**
   * Get estimated weight for a product (in kg)
   * Bitcoin mining hardware weight estimates
   */
  getEstimatedWeight(productId: string, category?: string): number {
    // Weights in kg - estimates for Bitcoin mining hardware
    const weights: Record<string, number> = {
      'antminer-s19': 13.5,
      'antminer-s19-pro': 14.5,
      'antminer-s19j-pro': 14.5,
      'antminer-s19-xp': 14.8,
      'whatsminer-m30s': 10.5,
      'whatsminer-m30s+': 11.5,
      'whatsminer-m50': 12.5,
      'avalon-1246': 12.0,
    };

    return weights[productId] || 5.0; // Default 5kg if not found
  }
}
