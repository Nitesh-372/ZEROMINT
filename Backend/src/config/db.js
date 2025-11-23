const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
module.exports = async function connectDB(){
  try{
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  }catch(err){
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
}
