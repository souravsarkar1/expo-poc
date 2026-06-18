export interface Instructor {
  id: number;
  gender: string;

  name: {
    title: string;
    first: string;
    last: string;
  };

  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: number | string;
    coordinates: {
      latitude: string;
      longitude: string;
    };
    timezone: {
      offset: string;
      description: string;
    };
  };

  email: string;

  login: {
    uuid: string;
    username: string;
    password: string;
    salt: string;
    md5: string;
    sha1: string;
    sha256: string;
  };

  dob: {
    date: string;
    age: number;
  };

  registered: {
    date: string;
    age: number;
  };

  phone: string;
  cell: string;

  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };

  nat: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  rating: number;
  category: string;
  instructor: {
    name: string;
    avatar: string;
    email: string;
    location: {
      street: {
        number: number;
        name: string;
      };
      city: string;
      state: string;
      country: string;
      postcode: number | string;
      coordinates: {
        latitude: string;
        longitude: string;
      };
      timezone: {
        offset: string;
        description: string;
      };
    };
  };
}

export interface RandomUsersResponse {
  statusCode: number;
  data: {
    page: number;
    limit: number;
    totalPages: number;
    previousPage: boolean;
    nextPage: boolean;
    totalItems: number;
    data: Instructor[];
  };
  message: string;
  success: boolean;
}

export interface RandomProductsResponse {
  statusCode: number;
  data: {
    page: number;
    limit: number;
    totalPages: number;
    previousPage: boolean;
    nextPage: boolean;
    totalItems: number;
    data: Product[];
  };
  message: string;
  success: boolean;
}