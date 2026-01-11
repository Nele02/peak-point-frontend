export interface Session {
  name: string;
  email: string;
  _id: string;
  token: string;
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  _id?: string;
}

export interface StoredImage {
  url: string;
  publicId?: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface Peak {
  _id?: string;
  name: string;
  description?: string;
  elevation: number;
  lat: number;
  lng: number;
  userid?: string;
  categories?: Array<Category> | string[];
  images: StoredImage[];
}
