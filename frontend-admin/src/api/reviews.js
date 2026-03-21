import API from './index';

export const getProductReviews = (productId) => API.get(`/reviews/product/${productId}`);
export const createReview = (data) => API.post('/reviews', data);
export const updateReviewStatus = (id, isApproved) => API.patch(`/reviews/${id}/status`, { isApproved });
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
