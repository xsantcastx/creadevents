import { Component, inject, OnInit, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { StripeCardElement } from '@stripe/stripe-js';

import { StripeService } from '../../services/stripe.service';
import { CartService } from '../../services/cart.service';
import { AddressService } from '../../services/address.service';
import { Address } from '../../models/cart';

@Component({
  standalone: true,
  selector: 'ts-payment-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss']
})
export class PaymentPage implements OnInit, AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(Auth);
  private functions = inject(Functions);
  private stripeService = inject(StripeService);
  private cartService = inject(CartService);
  private addressService = inject(AddressService);

  // State
  loading = signal(true);
  stripeReady = signal(false);
  processing = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Stripe
  private cardElement: StripeCardElement | null = null;
  cardErrors = signal<string | null>(null);

  // Data
  billingAddress = signal<Address | null>(null);
  cart = signal<any>(null);

  // Form for cardholder name (card details in Stripe Element)
  form = this.fb.group({
    cardholderName: ['', [Validators.required, Validators.minLength(3)]],
    saveCard: [false]
  });

  async ngOnInit() {
    await this.initializePayment();
  }

  async ngAfterViewInit() {
    // Wait for view to be fully initialized, then set up Stripe element
    // This ensures the card-element div exists in the DOM
    // Use a longer delay and retry mechanism
    this.waitForElementAndSetupStripe();
  }

  /**
   * Wait for the card-element div to be available in the DOM, then set up Stripe
   */
  private async waitForElementAndSetupStripe(attempts = 0, maxAttempts = 20) {
    const cardElementDiv = document.getElementById('card-element');
    
    if (cardElementDiv) {
      console.log('card-element div found after', attempts, 'attempts');
      await this.setupStripeElement();
      this.stripeReady.set(true);
    } else if (attempts < maxAttempts) {
      console.log('card-element not found, attempt', attempts + 1, '/', maxAttempts);
      // Wait 50ms and try again
      setTimeout(() => {
        this.waitForElementAndSetupStripe(attempts + 1, maxAttempts);
      }, 50);
    } else {
      console.error('card-element div never appeared in DOM after', maxAttempts, 'attempts');
      this.error.set('Payment form failed to load. Please refresh the page.');
    }
  }

  ngOnDestroy() {
    // Cleanup Stripe Elements
    if (this.cardElement) {
      this.cardElement.unmount();
      this.cardElement.destroy();
    }
  }

  /**
   * Initialize payment page
   */
  private async initializePayment() {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Check authentication
      const user = this.auth.currentUser;
      if (!user) {
        this.router.navigate(['/client/login'], {
          queryParams: { returnUrl: '/checkout/payment' }
        });
        return;
      }

      // Get cart
      const cart = this.cartService.snapshot();
      if (!cart || !cart.items || cart.items.length === 0) {
        this.error.set('Cart is empty');
        setTimeout(() => this.router.navigate(['/cart']), 2000);
        return;
      }
      this.cart.set(cart);

      // Get billing address (use default shipping address or any available address)
      this.addressService.getUserAddresses(user.uid).subscribe({
        next: (addresses) => {
          if (addresses && addresses.length > 0) {
            // Prefer default address, otherwise use first available
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
            this.billingAddress.set(defaultAddr);
            console.log('Billing address loaded:', defaultAddr.city, defaultAddr.region);
          } else {
            console.warn('No addresses found for user');
            this.error.set('No billing address found. Please add an address in the cart page.');
          }
        },
        error: (err) => {
          console.error('Failed to load billing address:', err);
          this.error.set('Failed to load billing address. Please try again.');
        }
      });

      // Don't set loading to false here - wait for Stripe element to be ready in ngAfterViewInit

    } catch (err: any) {
      console.error('Payment initialization error:', err);
      this.error.set(err.message || 'Failed to initialize payment');
    } finally {
      // Cart data is loaded, show the form (Stripe will initialize separately)
      this.loading.set(false);
    }
  }

  /**
   * Setup Stripe card element
   */
  private async setupStripeElement() {
    try {
      console.log('Setting up Stripe card element...');
      
      // Check if element exists in DOM
      const cardElementDiv = document.getElementById('card-element');
      if (!cardElementDiv) {
        console.error('card-element div not found in DOM!');
        this.error.set('Payment form container not found. Please refresh the page.');
        return;
      }
      
      console.log('card-element div found, creating Stripe element...');
      const result = await this.stripeService.createCardElement('card-element');
      
      if (result) {
        this.cardElement = result.cardElement;
        console.log('Stripe card element created and mounted successfully');

        // Listen for card validation errors
        this.cardElement.on('change', (event) => {
          console.log('Card element changed:', event);
          if (event.error) {
            this.cardErrors.set(event.error.message);
          } else {
            this.cardErrors.set(null);
          }
        });
        
        // Listen for ready event
        this.cardElement.on('ready', () => {
          console.log('Card element is ready for input');
        });
      } else {
        console.error('Failed to create Stripe element - result is null');
        this.error.set('Failed to initialize payment form.');
      }
    } catch (err) {
      console.error('Failed to setup Stripe element:', err);
      this.error.set('Failed to load payment form. Please refresh the page.');
    }
  }

  /**
   * Process payment
   */
  async processPayment() {
    if (this.form.invalid || !this.cardElement) {
      this.form.markAllAsTouched();
      this.error.set('Please fill in all required fields');
      return;
    }

    const cart = this.cart();
    const billingAddress = this.billingAddress();

    console.log('Processing payment with:', {
      hasCart: !!cart,
      cartId: cart?.id,
      cartTotal: cart?.total,
      hasBillingAddress: !!billingAddress,
      billingCity: billingAddress?.city
    });

    if (!cart || !billingAddress) {
      console.error('Missing required data:', { cart, billingAddress });
      this.error.set('Missing cart or billing information. Please return to cart and try again.');
      return;
    }

    if (!cart.id) {
      console.error('Cart has no ID:', cart);
      this.error.set('Invalid cart. Please return to cart and try again.');
      return;
    }

    this.processing.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      // Step 1: Create PaymentIntent via Cloud Function
      const createPaymentIntent = httpsCallable<
        { cartId: string },
        { clientSecret: string; paymentIntentId: string }
      >(this.functions, 'createPaymentIntent');

      const { data } = await createPaymentIntent({ cartId: cart.id! });

      // Step 2: Confirm payment with Stripe
      const cardholderName = this.form.value.cardholderName!;
      const result = await this.stripeService.confirmCardPayment(
        data.clientSecret,
        this.cardElement!,
        {
          name: cardholderName,
          email: billingAddress.email,
          phone: billingAddress.phoneE164,
          address: {
            line1: billingAddress.line1,
            line2: billingAddress.line2,
            city: billingAddress.city,
            state: billingAddress.region,
            postal_code: billingAddress.postalCode,
            country: billingAddress.country,
          },
        }
      );

      if (result.error) {
        // Payment failed
        const errorMessage = this.stripeService.getErrorMessage(result.error);
        this.error.set(errorMessage);
        this.processing.set(false);
        return;
      }

      // Payment succeeded!
      const paymentIntent = result.paymentIntent!;

      if (paymentIntent.status === 'succeeded') {
        this.success.set('Payment successful! Creating your order...');
        
        // DON'T clear cart here - webhook needs it to create the order
        // Cart will be cleared on the confirmation page after order is found
        
        // Navigate to order confirmation
        // The webhook will handle order creation
        setTimeout(() => {
          this.router.navigate(['/checkout/confirmation'], {
            queryParams: { payment_intent: paymentIntent.id }
          });
        }, 1500);
      } else if (paymentIntent.status === 'requires_action') {
        // Handle 3D Secure authentication
        const actionResult = await this.stripeService.handleCardAction(data.clientSecret);
        
        if (actionResult.error) {
          this.error.set(this.stripeService.getErrorMessage(actionResult.error));
        } else if (actionResult.paymentIntent?.status === 'succeeded') {
          this.success.set('Payment successful! Creating your order...');
          
          // DON'T clear cart here - webhook needs it to create the order
          // Cart will be cleared on the confirmation page after order is found
          
          setTimeout(() => {
            this.router.navigate(['/checkout/confirmation'], {
              queryParams: { payment_intent: actionResult.paymentIntent!.id }
            });
          }, 1500);
        }
      }

    } catch (err: any) {
      console.error('Payment processing error:', err);
      this.error.set(err.message || 'Payment failed. Please try again.');
    } finally {
      this.processing.set(false);
    }
  }

  /**
   * Go back to checkout review
   */
  backToReview() {
    this.router.navigate(['/checkout/review']);
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
