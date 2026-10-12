export interface User {
  id: number;
  name: string;
  age: number;
  city: string;
  state: string;
  pincode: string;
}

export interface CreateUser {
  name: string;
  age: number;
  city: string;
  state: string;
  pincode: string;
}