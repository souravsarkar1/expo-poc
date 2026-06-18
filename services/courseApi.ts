import { Instructor, Product, RandomProductsResponse, RandomUsersResponse } from '../types/course';

const BASE_URL = 'https://api.freeapi.app/api/v1';

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchInstructors(page = 1, limit = 10): Promise<Instructor[]> {
  const res = await fetchWithTimeout(`${BASE_URL}/public/randomusers?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch instructors');
  const json: RandomUsersResponse = await res.json();
  return json.data.data;
}

export async function fetchProducts(page = 1, limit = 10): Promise<Product[]> {
  const res = await fetchWithTimeout(`${BASE_URL}/public/randomproducts?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const json: RandomProductsResponse = await res.json();
  return json.data.data;
}

/**
 * Combines products (treated as courses) with instructors,
 * pairing them by index so each "course" gets an "instructor".
 */
export async function fetchCourses({
  pageParam = 1,
}: {
  pageParam?: number;
}) {
  const [products, instructors] = await Promise.all([
    fetchProducts(pageParam, 20),
    fetchInstructors(pageParam, 20),
  ]);

  const courses = products.map((product, index) => {
    const instructor = instructors[index % instructors.length];

    return {
      id: String(product.id),
      title: product.title,
      description: product.description,
      thumbnail: product.thumbnail,
      price: product.price,
      rating: product.rating,
      category: product.category,
      instructor: {
        name: `${instructor.name.title} ${instructor.name.first} ${instructor.name.last}`,
        avatar: instructor.picture.medium,
        email: instructor.email,
        location: instructor.location,
        gender: instructor.gender,
        phone: instructor.phone,
        cell: instructor.cell,
        dob: instructor.dob,
        registered: instructor.registered,
        picture: instructor.picture,
        nat: instructor.nat,
        id: instructor.id,
      },
    };
  });

  return {
    courses,
    nextPage: courses.length > 0 ? pageParam + 1 : undefined,
  };
}