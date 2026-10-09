export interface Submission {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  buyingIntent: string; // Question 1: Why are you buying?
  propertyType: string; // Question 2: Which property type?
  budget: string;       // Question 3: What's your budget?
  timeline: string;     // Question 4: When do you want to buy?
  submittedAt: string;
}
