import bcrypt from "bcryptjs";

const users = [
  {
    username: "Admin User",
    email: "admin@email.com",
    password : bcrypt.hashSync("123456", 10),
    isAdmin: true,
  },
  {
    username: "John Doe",
    email: "john@email.com",
    password : bcrypt.hashSync("123456", 10),
    isAdmin: false,
  },
  {
    username: "Jana Doe",
    email: "jana@email.com",
    password : bcrypt.hashSync("123456", 10),
    isAdmin: false,
  },
];

export default users;