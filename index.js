const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config()
const userRouter = require('./src/routes/UserRoutes');
const workRouter = require('./src/routes/WorkRoutes');
const jobRouter = require('./src/routes/JobRoutes');
const proposalRouter = require('./src/routes/ProposalRoutes');
const applicationRouter = require('./src/routes/ApplicationRoutes');
const notificationRouter = require('./src/routes/NotificationRoutes');
const bookmarkRouter = require('./src/routes/BookmarkRoutes');
const portfolioRouter = require('./src/routes/PortfolioRoutes');

const PORT = 3000;

//Connect to database
require('./src/config/db.js');

const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'https://workloop.vercel.app'],
    credentials: true
}));

app.use('/api/user', userRouter)
app.use('/api/work', workRouter)
app.use('/api/job', jobRouter)
app.use('/api/proposal', proposalRouter)
app.use('/api/application', applicationRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/bookmarks', bookmarkRouter)
app.use('/api/portfolio', portfolioRouter)

app.get('/', (req, res) => {
    res.send('Server created successfully!');
})

app.listen(PORT, console.log(`Server running on Port: ${PORT}`));