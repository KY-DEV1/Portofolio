const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Create email transporter dengan error handling
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email configuration missing');
    return null;
  }

  try {
    return nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    return null;
  }
};

// Send notification email
const sendNotificationEmail = async (contactData) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('⚠️  Skipping email - no transporter');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Contact: ${contactData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Subject:</strong> ${contactData.subject}</p>
          <p><strong>Message:</strong> ${contactData.message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Notification email sent');
  } catch (error) {
    console.error('❌ Error sending notification email:', error.message);
  }
};

// Create new contact message dengan database fallback
exports.createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if database is connected
    const dbConnected = mongoose.connection.readyState === 1;
    
    let savedContact = null;

    if (dbConnected) {
      // Save to database jika connected
      const contact = new Contact({ name, email, subject, message });
      savedContact = await contact.save();
      console.log('✅ Contact saved to database');
    } else {
      console.log('⚠️  Database not connected - skipping database save');
      // Continue without database save
      savedContact = { name, email, subject, message, _id: 'temp-' + Date.now() };
    }

    // Try to send emails (non-blocking)
    try {
      await sendNotificationEmail(savedContact);
    } catch (emailError) {
      console.error('❌ Email error:', emailError.message);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: savedContact,
      databaseSaved: dbConnected
    });

  } catch (error) {
    console.error('❌ Error in createContact:', error);
    
    // Even if there's an error, try to respond to user
    res.status(500).json({
      success: false,
      message: 'Message received, but there was a server error',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

// Get all contact messages dengan error handling
exports.getContacts = async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database unavailable'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments();

    res.json({
      success: true,
      data: contacts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};
