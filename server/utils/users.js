class Users {
  constructor() {
    this.users = [];
  }

  addUser(id, name, room) {
    var user = { id, name, room };
    this.users.push(user);
    return user;
  }

  removeUser(id) {
    this.users = this.users.filter(user => user.id !== id);
    return true;
  }

  getUser(id) {
    return this.users.filter(user => user.id == id).pop();
  }

  getUserList(room) {
    var users = this.users.filter(user => user.room === room);
    var nameArray = users.map(user => user.name);

    return nameArray;
  }
}

module.exports = { Users };
