const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Utility functions
const makeid = require("./utils/makeid");
const isDateValid = require("./utils/isDateValid");

const users = [];

const exercises = [];

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const findUser = () => {};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app
  .route("/api/users")
  .post((req, res) => {
    const username = req.body.username;
    if (username.length === 0) {
      res.json({ error: "Username is required" });
    } else if (username.length > 20) {
      res.json({ error: "Username is too long (max 20 characters)" });
    }

    const newUser = {
      username,
      _id: makeid(),
    };

    users.push(newUser);
    res.json(newUser);
  })
  .get((req, res) => {
    res.send(users);
  });

app.route("/api/users/:_id/exercises").post((req, res) => {
  const _id = req.params._id;
  const user = users.find((user) => user._id === _id);

  if (user === undefined) {
    return res.json({ error: "Can't find username matching requested id" });
  }

  const username = user.username;
  const description = req.body.description;
  const duration = Number(req.body.duration);

  const date = req.body.date;
  const formatedDate =
    date === ""
      ? new Date().toDateString()
      : new Date(req.body.date).toDateString();

  if (description.length === 0) {
    return res.json({ error: "Description is required" });
  } else if (description.length > 100) {
    return res.json({ error: "Description too long (max 100 characters)" });
  }

  if (duration.length === 0) {
    return res.json({ error: "Duration is required" });
  } else if (/^[0-9]*$/.test(duration) === false) {
    return res.json({ error: "Duration should be a number" });
  } else if (Number(duration) > 312480) {
    return res.json({
      error: "Duration too long (max 312480 min)",
    });
  }

  if (date.length > 0 && !isDateValid(date)) {
    return res.json({ error: "Invalid date" });
  }

  const newExercise = {
    _id,
    username,
    description,
    duration,
    date: formatedDate,
  };

  exercises.push(newExercise);

  res.json(newExercise);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const _id = req.params._id;
  const user = users.find((user) => user._id === _id);

  if (user === undefined) {
    return res.json({ error: "Can't find username matching requested id" });
  }

  const username = user.username;

  const log = exercises
    .filter((exercise) => exercise._id === _id)
    .map((exercise) => {
      const { description, duration, date } = exercise;

      return {
        description,
        duration,
        date,
      };
    });

  const count = log.length;

  res.json({
    _id,
    username,
    count,
    log,
  });
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/views/404.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
