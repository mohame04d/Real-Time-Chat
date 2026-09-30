const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    const search = req.query.search;
    let query = { _id: { $ne: req.user._id } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).select("-password").sort({ name: 1 });

    res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
