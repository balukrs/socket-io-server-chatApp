const users = [];

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  const user = { id, name, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const findUser = (id) => users.find((user) => user.id === id);

const checkUser = (username) =>
  users.length ? users.some((user) => username === user.name) : false;

const getUsersinroom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, findUser, checkUser, getUsersinroom };
