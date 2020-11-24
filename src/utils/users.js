const users = [];

//addUser, removeUser, grabUser, grabAllUsers
const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username && !room) {
    return {
      error: "Username and room are required",
    };
  }
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  if (existingUser) {
    return {
      error: "Username already exists",
    };
  }
  const user = {
    id,
    username,
    room,
  };
  users.push(user);
  return user;
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  const removedUser = users.splice(index, 1)[0];
  return removedUser;
};

const grabUser = (id) => {
  return users.find((user) => user.id === id);
};

const grabAllUsers = (room) => {
  const allUsers = users.filter((user) => user.room === room);
  return allUsers;
};

module.exports = {
  addUser,
  removeUser,
  grabUser,
  grabAllUsers,
};
