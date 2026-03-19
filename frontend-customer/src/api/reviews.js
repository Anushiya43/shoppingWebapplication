import API from './index';

export const getProductReviews = (productId) => API.get(`/reviews/product/${productId}`);
export const submitReview = (reviewData) => API.post('/reviews', reviewData);
