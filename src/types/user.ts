export interface DeliveryAddress {
  fullName: string;
  country: string;
  city: string;
  streetAddress: string;
  buildingApartment: string;
  postalCode: string;
  phoneNumber: string;
}

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  onboardingCompleted: boolean;
  onboardingSeenWelcome: boolean;
  genres: string[];
  favoriteAuthors: string[];
  aboutMe: string;
  deliveryAddress?: DeliveryAddress;
}

export type NewUserInput = Pick<UserRecord, "firstName" | "lastName" | "email" | "password">;

export interface OnboardingInput {
  genres: string[];
  favoriteAuthors: string[];
  aboutMe: string;
}
