const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const appointmentRoutes = require('./routes/appointmentRoutes.routes');
const blogRoutes = require('./routes/blogRoutes.routes');
const cardRoutes = require('./routes/cardRoutes.routes');
const authRoutes = require('./routes/authRoutes.routes');
const adminRoutes = require("./routes/adminRoutes.routes");
const fileUpload = require('express-fileupload');
const path = require("path");



const app = express();
const PORT = process.env.PORT || 5000;  


const _dirname = path.resolve();

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_CLOUD_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));

// Middleware
// Allow requests from specific origin
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'], // Change this to your client URL
  methods: 'GET,POST,PUT,DELETE', // Allowed HTTP methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true
}));
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/blogs', blogRoutes);
app.use('/uploads', express.static('uploads')); // Serve files from 'uploads' folder
app.use('/api/appointments', appointmentRoutes);
app.use("/api/cards", cardRoutes);
app.use("/auth", authRoutes);
app.use('/admin', adminRoutes);
// app.use("/api/blogs", blogRoutes);


app.use(express.static(path.join(_dirname, "/client/dist")));
app.get("*", (_, res)=>{
  res.sendFile(path.resolve(_dirname, "client", "dist", "index.html"));
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
