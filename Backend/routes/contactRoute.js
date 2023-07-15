const express = require("express");
const { createContact, getAllContacts, deleteContact, getContact } = require("../contollers/contactController");
const { isAuthUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();


router.route("/contact/create").post(createContact);
router.route("/admin/inbox").get(isAuthUser,authorizeRoles("admin"),getAllContacts);
router
  .route("/admin/contact/:id")
  .delete(isAuthUser, authorizeRoles("admin"), deleteContact)
  .get(isAuthUser,authorizeRoles("admin"),getContact);
module.exports = router;