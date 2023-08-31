import { Router } from "express";
import ProductManager from "../dao/mongomanagers/productmanager.js";
import { __dirname } from "../utils.js";

const pmanager = new ProductManager();
const router = Router();

//Obtiene la lista de productos
router.get("/", async(req,res)=>{
    const listaProductos = await pmanager.getProductsViews(req.query);
    console.log(listaProductos);
    res.render("home", {listaProductos});
});

//Acceso al formulario
router.get("/realtimeProducts", (req,res)=>{
    res.render("realtimeProducts");
});

//Acceso al chat
router.get("/chat", (req,res)=>{
    res.render("chat");
});

//Acceso a los productos
router.get("/productsme", async (req, res)=>{
    const products = await pmanager.getProducts(req.query);
    res.render("products", products);
});

router.get("/products", async (req, res) => {
    const products = await pmanager.getProductsPre(req.query);
    res.render("products", {products});
});
//Acceso a los productos por su ID
router.get("/products/:pid", async (req, res) => {
    const pid = req.params.pid;
    const product = await pmanager.getProductById(pid);

    res.render("product", {product});
});

export default router;
