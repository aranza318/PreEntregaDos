import express from "express";
import viewRouter from "./rutas/view.router.js";
import cartRouter from "./rutas/carts.router.js";
import productsRouter from "./rutas/products.router.js";
import handlebars from "express-handlebars";
import { allowInsecurePrototypeAccess} from '@handlebars/allow-prototype-access'
import connectMongo from "./config/dataBaseM.js";
import { __dirname } from "./utils.js";
import { Server} from "socket.io";
import Handlebars from "handlebars";



//Determina el puerto
const app = express();
const PORT =process.env.PORT||8020;

// Middlewares y rutas
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname +"/public"))
app.use("/images", express.static(__dirname+ "/public/images"));
app.engine("handlebars", handlebars.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set("view engine","handlebars");
app.set("views", __dirname+"/views")
app.use("/api", cartRouter);
app.use("/api", productsRouter);
app.use("/", viewRouter);

connectMongo()
//Socket.io
const httpServer=app.listen(PORT, () => {
    console.log("Servidor Activo en el puerto: " + PORT);
});

const socketServer = new Server(httpServer);

//Managers
import ProductManager from "./dao/mongomanagers/productmanager.js";
const PM = new ProductManager();

import MessagesManager from "./dao/mongomanagers/messagesmanager.js";
const MM = new MessagesManager();

import CartManager from "./dao/mongomanagers/cartmanager.js";

const CM = new CartManager();

// Sockets on 
socketServer.on("connection", async (socket)=>{
    console.log("Cliente conectado con ID: ", socket.id);
    const listadeproductos = await PM.getProductsViews();
    socketServer.emit("envioDeProductos", listadeproductos);


    socket.on("addProduct", async(obj)=>{
        await PM.addProduct(obj);
        const listadeproductos = await PM.getProductsViews();
        socketServer.emit("envioDeProductos", listadeproductos);    
    });
    
    socket.on("deleteProduct",async(id)=>{
        console.log(id);
        const listadeproductos=await PM.getProductsViews();
        
        await PM.deleteProduct(id);
        
        socketServer.emit("envioDeProducts", listadeproductos);
        });

    socket.on("addProduct", async(obj)=>{
        await CM.addProducts(obj);
        const listadeproductos = await CM.getCartById();
        socketServer.emit("envioDeProductos", listadeproductos);    
    });

    socket.on("nuevoUsuario",(usuario)=>{
        console.log("usuario", usuario);
        socket.broadcast.emit("broadcast", usuario);
        });

    socket.on("disconnet", ()=>{
        console.log("Usuario desconectado");
        });
    
    socket.on("mensaje", async (info) =>{
        console.log(info);
        await MM.createMessage(info);
        socketServer.emit("chat", await MM.getMessages());
    });


});     