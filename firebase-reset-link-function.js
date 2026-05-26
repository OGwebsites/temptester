const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

initializeApp();

exports.generateResetLink = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    return;
  }

  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const continueUrl = String(req.body?.continueUrl || "").trim();

    if (!email) {
      res.status(400).json({ error: "MISSING_EMAIL" });
      return;
    }

    const actionCodeSettings = continueUrl
      ? { url: continueUrl, handleCodeInApp: true }
      : undefined;

    const resetLink = await getAuth().generatePasswordResetLink(email, actionCodeSettings);
    res.status(200).json({ resetLink });
  } catch (error) {
    const message = error && error.message ? error.message : "RESET_LINK_CREATE_FAILED";
    res.status(400).json({ error: message });
  }
});
