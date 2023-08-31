import mongoose from "mongoose";

const URI =  "mongodb+srv://agalvaliz318:Imagine318@aranza.g9tojob.mongodb.net/ecommerce?retryWrites=true&w=majority";
const connectMongo = ()=>{
     try {
          mongoose.connect(URI)
          console.log("Base de Datos conectada a la Nube");
     } catch (error) {
          console.log(error);
     }
}

export default connectMongo;


