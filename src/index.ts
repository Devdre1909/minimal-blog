import { PrismaClient } from "@prisma/client";
import express from "express";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/user", async (req, res) => {
  const result = await prisma.user.create({
    data: { ...req.body },
  });
  res.json(result);
});

app.get("/feed", async (req, res) => {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    include: { author: true },
  });
  return res.json(posts);
});

app.post("/post", async (req, res) => {
  const { title, content, authorEmail } = req.body;
  const post = await prisma.post.create({
    data: {
      title,
      content,
      author: { connect: { email: authorEmail } },
    },
  });
  res.json(post);
});

app.put("/post/publish/:id", async (req, res) => {
    const {id} = req.params;
    const post = await prisma.post.update({
        where: { id: Number(id) },
        data: { published: true }
    })
    res.json(post)
})

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      error: true,
      message: "invalid author id",
    });
  }
  const authorPost = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
  });
  if (authorPost === null) {
    return res.json({
      message: "User have no posts",
    });
  }
  return res.json(authorPost);
});

app.delete("/post/:id", async(req, res) => {
    const {id} = req.params;
    const post = await prisma.post.delete({
        where: {id: Number(id)}
    })
    res.json(post)
})

async function main() {
  const newUser = await prisma.user.create({
    data: {
      name: "Michael",
      email: "michael1201@gmail.com",
      posts: {
        create: {
          title: "Love it!",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        },
      },
    },
  });

  console.log("Created user", newUser);

  const allUsers = await prisma.user.findMany({
    include: { posts: true },
  });
  console.log("All users");
  console.dir(allUsers, { depth: null });
}

// main()
//   .catch((e) => console.log(e))
//   .finally(async () => await prisma.$disconnect());

app.listen(3000, () => console.log("Server running on PORT 3000"));
