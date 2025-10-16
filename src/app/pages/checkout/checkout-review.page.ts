import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Auth } from '@angular/fire/auth';
import { combineLatest, map, switchMap, of, startWith } from 'rxjs';

import { CartService } from '../../services/cart.service';
import { AddressService } from '../../services/address.service';
import { ShippingService, ShippingMethod } from '../../services/shipping.service';
import { Address } from '../../models/cart';

interface CartItemDisplay {
  productId: string;
  name: string;
  imageUrl?: string;
  sku?: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

@Component({
  standalone: true,
  selector: 'ts-checkout-review-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './checkout-review.page.html',
  styleUrls: ['./checkout-review.page.scss']
})
export class CheckoutReviewPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(Auth);
  private cartService = inject(CartService);
  private addressService = inject(AddressService);
  private shippingService = inject(ShippingService);

  // State
  loading = signal(true);
  calculatingShipping = signal(false);
  error = signal<string | null>(null);
  showAddressForm = signal(false);
  savingAddress = signal(false);
  
  // Data
  addresses = signal<Address[]>([]);
  selectedAddress = signal<Address | null>(null);
  shippingMethods = signal<ShippingMethod[]>([]);
  selectedShippingMethod = signal<ShippingMethod | null>(null);

  // Form for address selection
  form = this.fb.group({
    addressId: ['', Validators.required],
    shippingMethodId: ['standard', Validators.required]
  });

  // Form for adding new address
  addressForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phoneE164: ['', [Validators.required, Validators.pattern(/^\+[1-9]\d{1,14}$/)]],
    line1: ['', Validators.required],
    line2: [''],
    city: ['', Validators.required],
    region: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['US', Validators.required],
    isDefault: [true]
  });

  // View model combining cart and display data
  vm$ = combineLatest([
    this.cartService.cart$,
    this.form.valueChanges.pipe(
      // Start with current form value so observable emits immediately
      startWith(this.form.value)
    )
  ]).pipe(
    map(([cart, formValue]) => {
      console.log('[CheckoutReview] vm$ - cart:', cart, 'formValue:', formValue);
      if (!cart || !cart.items.length) {
        console.log('[CheckoutReview] vm$ - No cart or empty cart');
        return null;
      }

      const items: CartItemDisplay[] = cart.items.map(item => ({
        productId: item.productId,
        name: item.name,
        imageUrl: item.imageUrl,
        sku: item.sku,
        qty: item.qty,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.qty
      }));

      const vm = {
        items,
        subtotal: cart.subtotal || 0,
        shipping: cart.shipping || 0,
        tax: cart.tax || 0,
        discount: cart.discount || 0,
        total: cart.total || 0,
        currency: cart.currency || 'USD',
        shippingMethodId: cart.shippingMethodId
      };
      
      console.log('[CheckoutReview] vm$ - returning vm:', vm);
      return vm;
    })
  );

  ngOnInit() {
    this.loadCheckoutData();
  }

  /**
   * Load user addresses and cart data
   */
  private async loadCheckoutData() {
    try {
      this.loading.set(true);
      this.error.set(null);

      const user = this.auth.currentUser;
      if (!user) {
        // Redirect to login if not authenticated
        this.router.navigate(['/client/login'], {
          queryParams: { returnUrl: '/checkout/review' }
        });
        return;
      }

      // Check if cart has items
      const cart = this.cartService.snapshot();
      if (!cart || !cart.items || cart.items.length === 0) {
        this.error.set('Your cart is empty. Please add items before checking out.');
        setTimeout(() => {
          this.router.navigate(['/cart']);
        }, 2000);
        return;
      }

      // Load user addresses
      this.addressService.getUserAddresses(user.uid).subscribe({
        next: (addresses) => {
          this.addresses.set(addresses);
          
          // Auto-select default address
          const defaultAddr = addresses.find(a => a.isDefault);
          if (defaultAddr) {
            this.selectedAddress.set(defaultAddr);
            this.form.patchValue({ addressId: defaultAddr.id });
            
            // Calculate shipping for default address
            this.calculateShipping(defaultAddr);
          }
        },
        error: (err) => {
          console.error('Failed to load addresses:', err);
          this.error.set('Failed to load shipping addresses. Please try again.');
        }
      });

    } catch (err: any) {
      console.error('Checkout initialization error:', err);
      this.error.set(err.message || 'Failed to initialize checkout');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Handle address selection change
   */
  onAddressChange(addressId: string) {
    const address = this.addresses().find(a => a.id === addressId);
    if (address) {
      this.selectedAddress.set(address);
      this.calculateShipping(address);
    }
  }

  /**
   * Handle shipping method selection change
   */
  onShippingMethodChange(methodId: string) {
    const method = this.shippingMethods().find(m => m.id === methodId);
    if (method) {
      this.selectedShippingMethod.set(method);
      // TODO: Update cart with selected shipping method
      // For now, the cloud function applies standard by default
    }
  }

  /**
   * Calculate shipping costs based on selected address
   */
  private calculateShipping(address: Address) {
    const cart = this.cartService.snapshot();
    if (!cart || !cart.id) {
      this.error.set('Cart not found');
      return;
    }

    this.calculatingShipping.set(true);
    this.error.set(null);

    this.shippingService.calculateShipping(cart.id, {
      country: address.country,
      region: address.region,
      postalCode: address.postalCode
    }).subscribe({
      next: (response) => {
        this.shippingMethods.set(response.shippingMethods);
        
        // Auto-select standard shipping
        const standard = response.shippingMethods.find(m => m.id === 'standard');
        if (standard) {
          this.selectedShippingMethod.set(standard);
          this.form.patchValue({ shippingMethodId: 'standard' });
        }

        // Cart totals are automatically updated by the Cloud Function
        this.calculatingShipping.set(false);
      },
      error: (err) => {
        console.error('Shipping calculation error:', err);
        this.error.set('Failed to calculate shipping. Please try again.');
        this.calculatingShipping.set(false);
      }
    });
  }

  /**
   * Navigate to add new address
   */
  addNewAddress() {
    this.router.navigate(['/client/addresses/new'], {
      queryParams: { returnUrl: '/checkout/review' }
    });
  }

  /**
   * Save new address from inline form
   */
  async saveNewAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.error.set('Please fill in all required fields');
      return;
    }

    this.savingAddress.set(true);
    this.error.set(null);

    try {
      const addressData = this.addressForm.value as Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
      const addressId = await this.addressService.createAddress(addressData);
      
      console.log('[CheckoutReview] Address created:', addressId);
      
      // Reload addresses
      const user = this.auth.currentUser;
      if (user) {
        this.addressService.getUserAddresses(user.uid).subscribe({
          next: (addresses) => {
            this.addresses.set(addresses);
            
            // Auto-select the newly created address
            const newAddress = addresses.find(a => a.id === addressId);
            if (newAddress) {
              this.selectedAddress.set(newAddress);
              this.form.patchValue({ addressId: newAddress.id });
              this.calculateShipping(newAddress);
            }
            
            // Hide the form
            this.showAddressForm.set(false);
            this.addressForm.reset({ country: 'US', isDefault: true });
          }
        });
      }
    } catch (err: any) {
      console.error('[CheckoutReview] Failed to save address:', err);
      this.error.set(err.message || 'Failed to save address');
    } finally {
      this.savingAddress.set(false);
    }
  }

  /**
   * Cancel adding new address
   */
  cancelAddAddress() {
    this.showAddressForm.set(false);
    this.addressForm.reset({ country: 'US', isDefault: true });
    this.error.set(null);
  }

  /**
   * Proceed to payment
   */
  async proceedToPayment() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please select a shipping address and method');
      return;
    }

    const address = this.selectedAddress();
    const shippingMethod = this.selectedShippingMethod();

    if (!address || !shippingMethod) {
      this.error.set('Please select a shipping address and method');
      return;
    }

    // Navigate to payment page
    this.router.navigate(['/checkout/payment']);
  }

  /**
   * Go back to cart
   */
  backToCart() {
    this.router.navigate(['/cart']);
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }
}
