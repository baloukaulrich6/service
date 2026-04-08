export type AlertType =
  | 'price_above'
  | 'price_below'
  | 'change_percent'
  | 'rsi_overbought'
  | 'rsi_oversold'
  | 'macd_crossover';

export interface AlertRule {
  id: string;
  symbol: string;
  type: AlertType;
  threshold: number;
  isActive: boolean;
  createdAt: string;
}

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  symbol: string;
  message: string;
  triggeredAt: string;
  isRead: boolean;
}
