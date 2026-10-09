const mongoose=require("mongoose");
const connectDB=async()=>{
	try{
		await mongoose.connect(process.env.DB_URL);
		console.log("MongoDB connect successfully");
	}
	catch(err){
		console.log("mongoDB connection failed: ",
			err.message
		);
		process.exit(1);
	}
};
module.exports=connectDB;