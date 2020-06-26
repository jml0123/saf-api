const AuthService = require("../auth/auth-service");
const bcrypt = require("bcryptjs");

function requireAuth(req, res, next) {
  const authToken = req.get("authorization") || "";
  let basicToken;
  if (!authToken.toLowerCase().startsWith("basic ")) {
    return res.status(401).json({ error: "Missing basic token" });
  } else {
    basicToken = authToken.slice("basic ".length, authToken.length);
  }

  const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(
    basicToken
  );

  if (!tokenUserName || !tokenPassword) {
    return res.status(401).json({ error: "Unauthorized request" });
  }

  AuthService.getUserWithUserName(req.app.get("db"), tokenUserName)

    .then((curator) => {
      if (!curator) {
        console.log("curator" + curator + "not found");
        return res.status(401).json({ error: "Unauthorized request" });
      }
      return bcrypt
        .compare(tokenPassword, curator.password)
        .then((passwordsMatch) => {
          if (!passwordsMatch) {
            console.log("passwords don't match");
            return res.status(401).json({ error: "Unauthorized request" });
          }
          req.curator = curator;
          next();
        });
    })
    .catch(next);
}

module.exports = {
  requireAuth,
};
