import jwt from "jsonwebtoken";

import { db } from "../db.js";

export const getPosts = (req, res) => {
  const q = req.query.category
    ? "SELECT * FROM posts WHERE category = ?"
    : "SELECT * FROM posts";

  db.query(q, [req.query.category], (err, data) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(data);
  });
};

export const getPost = (req, res) => {
  const q =
    "SELECT p.id, `username`, `title`, `description`, p.imgUrl, u.imgUrl AS userImg, `category`, `date` FROM users u JOIN posts p ON u.id = p.userId WHERE p.id = ?";

  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data[0]);
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.access_token;

  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid");

    const q =
      "INSERT INTO posts (`title`, `description`, `imgUrl`, `category`, `date`, `userId`) VALUES (?)";

    const values = [
      req.body.title,
      req.body.description,
      req.body.imgUrl,
      req.body.category,
      req.body.date,
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);

      return res.json("Post has been created!");
    });
  });
};

export const deletePost = (req, res) => {
  // Смотрим на id того кто удаляет этот пост и если его id совпадает
  // с id того кто написал этот пост - пост удаляется

  const token = req.cookies.access_token;

  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid");

    const postId = req.params.id;
    const q = "SELECT * FROM posts WHERE `id` = ?";
    // const q = "DELETE FROM posts WHERE `id` = ? AND `userId` = ?";

    db.query(q, [postId], (err, data) => {
      if (data[0].userId === userInfo.id) {
        const q = "DELETE FROM posts WHERE `id` = ?";

        db.query(q, [postId], (err, data) => {
          if (err) return res.json(err);

          return res.json("Post has been deleted!");
        });
      } else {
        return res.status(403).json("You can delete only your post!");
      }
    });

    // db.query(q, [postId, userInfo.id], (err, data) => {
    //   if (err) return res.status(403).json("You can delete only your post!");

    //   // console.log(postId, userInfo.id);
    //   console.log(data);

    //   return res.json("Post has been deleted!");
    // });
  });
};

export const updatePost = (req, res) => {
  const token = req.cookies.access_token;

  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid");

    const q =
      "UPDATE posts SET `title` = ?, `description` = ?, `imgUrl` = ?, `category` = ? WHERE `id` = ? AND `userId` = ?";

    const postId = req.params.id;
    const values = [
      req.body.title,
      req.body.description,
      req.body.imgUrl,
      req.body.category,
    ];

    db.query(q, [...values, postId, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);

      return res.json("Post has been updated!");
    });
  });
};
