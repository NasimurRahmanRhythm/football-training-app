const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  organizations: [{ type: String }],
  members: [{ type: String }],
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export default Admin;