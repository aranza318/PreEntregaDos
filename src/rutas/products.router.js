import { Router } from "express";
import ProductManager from "../dao/mongomanagers/productmanager.js";
import { __dirname } from "../utils.js";
import { productModel } from "../dao/models/product.model.js";
import { mongo , ObjectId } from "mongoose";


const productsRouter = Router();
const manager = new ProductManager();

productsRouter.get("/products", async (req, res) => {
    const products = await manager.getProductsPre(req.query);

    res.send({products});
});

//Obtiene la lista de productos prueba en postman con query
productsRouter.get("/productsme", async (request, response)=>{
    try {
        let { limit, page, sort, category } = request.query
        console.log(request.originalUrl);
        console.log(request.originalUrl.includes('page'));
  
        const options = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            sort: { price: Number(sort) }
        };
  
        if (!(options.sort.price === -1 || options.sort.price === 1)) {
            delete options.sort
        }
  
  
        const links = (products) => {
            let prevLink;
            let nextLink;
            if (request.originalUrl.includes('page')) {
                  // Si la URL original contiene el parámetro 'page', entonces:
  
                prevLink = products.hasPrevPage ? request.originalUrl.replace(`page=${products.page}`, `page=${products.prevPage}`) : null;
                nextLink = products.hasNextPage ? request.originalUrl.replace(`page=${products.page}`, `page=${products.nextPage}`) : null;
                return { prevLink, nextLink };
            }
            if (!request.originalUrl.includes('?')) {
                  // Si la URL original NO contiene el carácter '?', entonces:
  
                prevLink = products.hasPrevPage ? request.originalUrl.concat(`?page=${products.prevPage}`) : null;
                nextLink = products.hasNextPage ? request.originalUrl.concat(`?page=${products.nextPage}`) : null;
                return { prevLink, nextLink };
            }
              // Si la URL original contiene el carácter '?' (otros parámetros), entonces:
  
            prevLink = products.hasPrevPage ? request.originalUrl.concat(`&page=${products.prevPage}`) : null;
            nextLink = products.hasNextPage ? request.originalUrl.concat(`&page=${products.nextPage}`) : null;
            console.log(prevLink)
            console.log(nextLink)
  
            return { prevLink, nextLink };
  
        }
  
        // Devuelve un array con las categorias disponibles y compara con la query "category"
        const categories = await manager.categories();
  
        const result = categories.some(categ => categ === category)
        if (result) {
  
            const products = await manager.getProducts({ category }, options);
            const { prevLink, nextLink } = links(products);
            const { totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, docs } = products
            return response.status(200).send({ status: 'success', payload: docs, totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, prevLink, nextLink });
        }
  
        const products = await manager.getProducts({}, options);
        // console.log(products, 'Product');
        const { totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, docs } = products
        const { prevLink, nextLink } = links(products);
        return response.status(200).send({ status: 'success', payload: docs, totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, prevLink, nextLink });
    } catch (err) {
        console.log(err);
    }
   
});

//Obtiene el producto por su id
productsRouter.get("/products/:pid", async (request, response)=>{
   const pid = request.params.pid;
   const product = await manager.getProductByID(pid);
   response.send({product}) 
});

//Agrega un nuevo producto
productsRouter.post("/products", async (request,response)=>{
    const obj= request.body;
    const newProduct = await manager.addProduct(obj);
    response.json({status:"success", newProduct})
});

//Actualiza el producto
productsRouter.put("/products/:pid", async (req,res)=>{
    let pid = req.params.pid;
    let {title, description, code, price, status, stock, category, thumbnail} = req.body;

    if (!title) {
        res.status(400).send({status:"error", message:"Error! No se cargó el campo Title!"});
        return false;
    }

    if (!description) {
        res.status(400).send({status:"error", message:"Error! No se cargó el campo Description!"});
        return false;
    }

    if (!code) {
        res.status(400).send({status:"error", message:"Error! No se cargó el campo Code!"});
        return false;
    }

    if (!price) {
        res.status(400).send({status:"error", message:"Error! No se cargó el campo Price!"});
        return false;
    }

    status = !status && true;

    if (!stock) {
        res.status(400).send({status:"error", message:"Error! No se cargó el campo Stock!"});
        return false;
    }

    if (!category) {
        res.status(400).send({status:"error", message:"Error! No se cargó el campo Category!"});
        return false;
    }

    if (!thumbnail) {
        res.status(400).send({status:"error", message:"Error! No se cargó el campo Thumbnail!"});
        return false;
    }

    const result = await manager.updateProduct(pid, {title, description, code, price, status, stock, category, thumbnail});

    if (result) {
        res.send({status:"ok", message:"El Producto se actualizó correctamente!"});
    } else {
        res.status(500).send({status:"error", message:"Error! No se pudo actualizar el Producto!"});
    }
});

//Borra el producto por su ID
productsRouter.delete("/products/:pid", async (req, res) => {
    let pid = req.params.pid;
    const result = await manager.deleteProduct(pid)

    if (result) {
        res.send({status:"ok", message:"El Producto se eliminó correctamente!"});
    } else {
        res.status(500).send({status:"error", message:"Error! No se pudo eliminar el Producto!"});
    }
});

export default productsRouter;