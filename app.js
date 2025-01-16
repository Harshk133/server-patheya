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



const app = express();
const PORT = process.env.PORT;

// MongoDB Connection
// mongoose
//   .connect('mongodb://localhost:27017/patheyadb')
//   .then(() => console.log('MongoDB Connected'))
  // .catch((err) => console.error(err));
mongoose
  .connect(process.env.MONGO_CLOUD_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));

// Middleware
app.use(cors());
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



app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
