export enum PaymentStatusEnum {
  pending = 'pending',
  completed = 'completed',
  failed = 'failed',
  refunded = 'refunded',
  cancelled = 'cancelled',
}

export enum PaymentMethodEnum {
  cash = 'cash',
  creditCard = 'credit_card',
  debitCard = 'debit_card',
  insurance = 'insurance',
  mobileWallet = 'mobile_wallet', // Vodafone Cash, etc.
}