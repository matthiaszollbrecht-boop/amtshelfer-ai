// Google Play Billing via the Digital Goods API (TWA/Trusted Web Activity)
// https://developer.chrome.com/docs/android/trusted-web-activity/receive-payments-play-billing

export const PRODUCT_IDS = {
  MONTHLY: 'premium_monthly',
  YEARLY: 'premium_yearly',
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

export interface ProductDetails {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
}

export interface PurchaseResult {
  productId: string;
  purchaseToken: string;
}

// Digital Goods API types (not in standard lib)
interface ItemDetails {
  itemId: string;
  title: string;
  description: string;
  price: { value: string; currency: string };
  type: string;
}
interface PurchaseDetails {
  itemId: string;
  purchaseToken: string;
}
interface DigitalGoodsService {
  getDetails(itemIds: string[]): Promise<ItemDetails[]>;
  listPurchases(): Promise<PurchaseDetails[]>;
  listPurchaseHistory(): Promise<PurchaseDetails[]>;
}
declare global {
  interface Window {
    getDigitalGoodsService?: (serviceProvider: string) => Promise<DigitalGoodsService | null>;
  }
}

const PLAY_BILLING_URL = 'https://play.google.com/billing';

async function getService(): Promise<DigitalGoodsService | null> {
  if (typeof window === 'undefined' || !window.getDigitalGoodsService) return null;
  try {
    return await window.getDigitalGoodsService(PLAY_BILLING_URL);
  } catch {
    return null;
  }
}

export function isGooglePlayBillingAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.getDigitalGoodsService === 'function';
}

export async function getProductDetails(): Promise<ProductDetails[]> {
  const service = await getService();
  if (!service) return getFallbackDetails();

  try {
    const items = await service.getDetails([PRODUCT_IDS.MONTHLY, PRODUCT_IDS.YEARLY]);
    return items.map(item => ({
      productId: item.itemId,
      title: item.title,
      description: item.description,
      price: formatPrice(item.price.value, item.price.currency),
      currency: item.price.currency,
    }));
  } catch {
    return getFallbackDetails();
  }
}

function getFallbackDetails(): ProductDetails[] {
  return [
    {
      productId: PRODUCT_IDS.MONTHLY,
      title: 'Premium Monat',
      description: 'Unbegrenzte Analysen, Archiv & mehr',
      price: '6,99 €',
      currency: 'EUR',
    },
    {
      productId: PRODUCT_IDS.YEARLY,
      title: 'Premium Jahr',
      description: 'Unbegrenzte Analysen — 2 Monate gratis',
      price: '69,99 €',
      currency: 'EUR',
    },
  ];
}

function formatPrice(value: string, currency: string): string {
  try {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(parseFloat(value));
  } catch {
    return `${value} ${currency}`;
  }
}

export async function purchaseSubscription(productId: ProductId): Promise<PurchaseResult> {
  if (!isGooglePlayBillingAvailable()) {
    throw new BillingError('not_available', 'Google Play Billing ist nicht verfügbar. Bitte nutzen Sie die App aus dem Google Play Store.');
  }

  if (typeof PaymentRequest === 'undefined') {
    throw new BillingError('not_available', 'PaymentRequest API nicht verfügbar.');
  }

  const request = new PaymentRequest(
    [{ supportedMethods: PLAY_BILLING_URL, data: { sku: productId } }],
    { total: { label: 'AmtsHelfer AI Premium', amount: { currency: 'EUR', value: '0' } } }
  );

  let response: PaymentResponse;
  try {
    response = await request.show();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new BillingError('cancelled', 'Kauf wurde abgebrochen.');
    }
    throw new BillingError('purchase_failed', 'Kauf konnte nicht gestartet werden.');
  }

  const purchaseToken: string = (response.details as { token?: string }).token ?? '';
  if (!purchaseToken) {
    await response.complete('fail');
    throw new BillingError('no_token', 'Kein Kauftoken erhalten. Bitte erneut versuchen.');
  }

  // Complete the payment UI immediately; server-side acknowledgement happens via edge function
  await response.complete('success');

  return { productId, purchaseToken };
}

export async function getExistingPurchases(): Promise<PurchaseResult[]> {
  const service = await getService();
  if (!service) return [];

  try {
    const purchases = await service.listPurchases();
    return purchases
      .filter(p => p.itemId === PRODUCT_IDS.MONTHLY || p.itemId === PRODUCT_IDS.YEARLY)
      .map(p => ({ productId: p.itemId, purchaseToken: p.purchaseToken }));
  } catch {
    return [];
  }
}

export class BillingError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'BillingError';
  }
}
