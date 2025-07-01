const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const env = require('./configs/env.config');
const db = require('./configs/db.config');
const errorHandler = require('./middleware/errorHandler.middleware');

//routes required
const authRoute = require('.//routes/auth.route');
const publicRoute = require('./routes/public.route');
const bookingRoute = require('./routes/booking.route');
const adminRoute = require('./routes/admin.route');
const reportRoute = require('./routes/report.route');

const app = express();

//middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

//routes
app.use('/api/auth', authRoute);
app.use('/api', publicRoute);
app.use('/api', bookingRoute);
app.use('/api/admin', adminRoute);
app.use('/api/reports', reportRoute);

app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});

//db connection and server listen
db.authenticate()
    .then(() => {
        console.log('DB connected');
        return db.sync();
    })
    .then(() => {
        app.listen(env.port, () => {
            console.log(`Server started on http://localhost:${env.port}`);
        });
    })
    .catch((err) => {
        console.error('DB connection Error:', err);
    });