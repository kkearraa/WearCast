//Every closet query is filtered by this user id.
export const GUEST_ID = 'guest';

let currentUserId = GUEST_ID;

export const getCurrentUserId = () => currentUserId;
export const setCurrentUserId = (id) => {
  currentUserId = id || GUEST_ID;
};
