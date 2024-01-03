import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB from './db/index.js';

//configure dotenv
dotenv.config({ path: '/.env' });

//connect database and listening to port
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running on port ${process.env.PORT || 4000}`);
    });
  })
  .catch(error => {
    console.log('Database connection error: ' + error);
  });
