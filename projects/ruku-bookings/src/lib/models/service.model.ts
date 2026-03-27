export interface Service {
  Id: number | null;
  Title: string;
  FileName: string;
  Description: string;
  Features?: string[];
  PricingPlans?: Array<{
    Name: string;
    InitialSetupFee: string;
    MonthlySubscription: string;
    Features: string[];
  }>;
}
