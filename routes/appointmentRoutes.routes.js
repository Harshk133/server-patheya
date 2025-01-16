// const express = require('express');
// const router = express.Router();
// const Appointment = require('../models/Appointment.model');

// // Create Appointment
// router.post('/', async (req, res) => {
//   try {
//     const appointment = new Appointment(req.body);
//     await appointment.save();
//     res.status(201).json(appointment);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Get All Appointments
// router.get('/', async (req, res) => {
//   try {
//     const appointments = await Appointment.find();
//     res.status(200).json(appointments);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete Appointment
// router.delete('/:id', async (req, res) => {
//   try {
//     await Appointment.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: 'Appointment deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment.model');

// router.get("/analysis", async (req, res) => {
//   try {
//     const appointments = await Appointment.find(); // Fetch all appointments
//     const pending = appointments.filter(a => a.status === "Pending").length;
//     const chartData = {
//       labels: ["Completed", "Pending"],
//       datasets: [
//         {
//           label: "Appointment Status",
//           data: [appointments.length - pending, pending],
//           backgroundColor: ["#4caf50", "#ff5722"]
//         }
//       ]
//     };
//     res.json({
//       total: appointments.length,
//       pending,
//       chartData
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch appointment metrics" });
//   }
// });


router.get("/analysis", async (req, res) => {
  try {
    // Fetch all appointments
    const appointments = await Appointment.find();

    // Count appointments based on their statuses
    const statusCounts = appointments.reduce((acc, appointment) => {
      const status = appointment.status || "Unknown"; // Handle missing status
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Prepare labels and data for the chart
    const chartData = {
      labels: Object.keys(statusCounts), // ["Completed", "Pending", "Rescheduled", "Canceled", ...]
      datasets: [
        {
          label: "Appointment Status",
          data: Object.values(statusCounts), // [count of Completed, Pending, Rescheduled, ...]
          backgroundColor: [
            "#4caf50", // Green for Completed
            "#ff9800", // Orange for Pending
            "#2196f3", // Blue for Rescheduled
            "#f44336", // Red for Canceled
            "#9e9e9e" // Gray for Unknown or additional statuses
          ].slice(0, Object.keys(statusCounts).length), // Slice to match the number of labels
        },
      ],
    };

    // Calculate total appointments
    const total = appointments.length;

    res.json({
      total,
      statusCounts, // Include raw counts of each status
      chartData,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointment metrics" });
  }
});


// Create Appointment ✅
router.post('/', async (req, res) => {
  // const { name, email, phone, date, timeSlot, notes } = req.body;
  const { name, email, date, timeSlot, notes } = req.body;

  try {
    const newAppointment = new Appointment({
      name,
      email,
      // phone,
      date,
      timeSlot,
      notes,
    });

    await newAppointment.save();
    res.status(201).json({ message: "Appointment booked successfully!" });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to book appointment",
    });
  }
});

// Get All Appointments ✅
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Appointment by ID ✅
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Appointment (e.g., changing status, rescheduling) ✅
router.put('/:id', async (req, res) => {
  try {
    const { status, date, timeSlot, notes } = req.body;
    
    // You can update any fields based on your requirement
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, date, timeSlot, notes },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json({
      message: 'Appointment updated successfully!',
      updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Appointment ✅
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(200).json({ message: 'Appointment deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Get Appointments by Status (filter by status) ✅
router.get('/status/:status', async (req, res) => {
  const { status } = req.params;
  try {
    const appointments = await Appointment.find({ status });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Appointments by Date Range ✅
router.get('/date/:startDate/:endDate', async (req, res) => {
  const { startDate, endDate } = req.params;
  try {
    const appointments = await Appointment.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Appointments by Specific Date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Convert the string date to a Date object (assuming date is in 'YYYY-MM-DD' format)
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999); // End of the day
    
    // Query to find appointments within that specific date range
    const appointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




module.exports = router;
