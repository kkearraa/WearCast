// Who is using the app right now? Every closet query is filtered by this user id.
// For now it's always the built-in guest. Step 2 (real accounts) will set it on
// login and remember it between launches.
export const GUEST_ID = 'guest';

let currentUserId = GUEST_ID;

export const getCurrentUserId = () => currentUserId;
export const setCurrentUserId = (id) => {
  currentUserId = id || GUEST_ID;
};
