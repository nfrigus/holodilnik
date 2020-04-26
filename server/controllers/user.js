const router = require("express").Router();
const { ObjectId } = require("mongodb");
const { getUserIdByToken } = require("../services/signIn");

router.get("/auth", verificationResponse);
router.put("/ingredients", putUserIngredients);
router.get("/ingredients", getUserIngredients);


function verificationResponse(req, res) {
  return res.sendStatus(200);
}

async function putUserIngredients(req, res) {
  try {
    const authString = req.headers.authorization;
    const userId = await getUserIdByToken(authString);
    const db = req.app.get("mongoDB");
    await db.collection("users").updateOne({
      _id: ObjectId(userId),
    }, {
      $set: {
        ingredients: req.body.ingredients,
      },
    }, {
      upsert: true,
    });
    return res.status(200).json();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: `${err}`,
    });
  }
}

async function getUserIngredients(req, res) {
  const authString = req.headers.authorization;
  const userId = await getUserIdByToken(authString);
  const db = req.app.get("mongoDB");
  const obj = await db.collection("users").findOne({ _id: ObjectId(userId) });
  res.json(obj.ingredients);
}

module.exports = router;
