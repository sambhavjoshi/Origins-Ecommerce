const express = require('express');
const { registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateUserProfile, getAllUsers, getSingleUser, updateProfileAdmin, deleteUser } = require('../contollers/userController');
const { isAuthUser, authorizeRoles } = require('../middleware/auth');
const router = express.Router();


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthUser,getUserDetails);
router.route("/me/update").put(isAuthUser,updateUserProfile);
router.route("/password/update").put(isAuthUser,updatePassword);
router.route("/admin/users").get(isAuthUser,authorizeRoles("admin"),getAllUsers);
router.route("/admin/user/:id").get(isAuthUser,authorizeRoles("admin"),getSingleUser).put(isAuthUser,authorizeRoles("admin"),updateProfileAdmin).delete(isAuthUser,authorizeRoles("admin"),deleteUser);
module.exports = router;