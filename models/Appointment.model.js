const mongoose = require('mongoose');

// const AppointmentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   phone: { type: String, required: true },
//   date: { type: Date, required: true },
//   timeSlot: { type: String, required: true },
// });

// module.exports = mongoose.model('Appointment', AppointmentSchema);


// const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address',
    ],
  },
  // phone: {
  //   type: String,
  //   unique: true,
  //   required: [true, 'Phone number is required'],
  //   match: [
  //     /^\d{10}$/,
  //     'Phone number must be 10 digits',
  //   ],
  // },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function (value) {
        return value > new Date(); // Ensures the date is in the future
      },
      message: 'Appointment date must be in the future',
    },
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    enum: {
      values: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'], // Example predefined slots
      message: 'Invalid time slot',
    },
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Canceled', 'Rescheduled'],
    default: 'Pending',
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// module.exports = mongoose.model('Appointment', AppointmentSchema);



// const appointmentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   phone: { type: String, required: true },
//   date: { type: Date, required: true },
//   timeSlot: { type: String, required: true },
//   day: { type: String, required: true },
// });

module.exports = mongoose.model('Appointment', appointmentSchema);