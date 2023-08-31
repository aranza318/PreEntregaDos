import { request } from "express";
import { productModel } from "../models/product.model.js";


export default class ProductManager {
 
    //Categorias de discriminacion de productos
    categories = async()=>{
        try {
            const categories = await productModel.aggregate([
                {
                    $group:{
                        _id:null,
                        categories:{$addToSet:"$category"}
                    }
                }
            ])
            return categories[0].categories
        } catch (error) {
            console.log(error);
            return error
        }
    }
    
    //Muestra los objetos en la nube y trabaja con los filtros por postman
     getProducts = async (filter, options) => {
        try {
            let products = await productModel.paginate(query, {limit:limit, page:page, sort:{price:sort}});
            products = {payload:products.docs, totalPages:products.totalPages, prevPage:products.prevPage, nextPage:products.nextPage, page:products.page, hasPrevPage:products.hasPrevPage, hasNextPage:products.hasNextPage, prevLink:prevLink, nextLink:nextLink};
            return await productModel.paginate(filter, options);
        } catch (err) {
            return err
        }
    }

       async getProductsPre(params) {
        let {limit, page, query, sort} = params
        limit = limit ? limit : 10;
        page = page ? page : 1;
        query = query || {};
        sort = sort ? sort == "asc" ? 1 : -1 : 0;
        let products = await productModel.paginate(query, {limit:limit, page:page, sort:{price:sort}});
        let status = products ? "success" : "error";

        let prevLink = products.hasPrevPage ? "http://localhost:8050/products?limit=" + limit + "&page=" + products.prevPage : null;
        let nextLink = products.hasNextPage ? "http://localhost:8050/products?limit=" + limit + "&page=" + products.nextPage : null;
        
        products = {status:status, payload:products.docs, totalPages:products.totalPages, prevPage:products.prevPage, nextPage:products.nextPage, page:products.page, hasPrevPage:products.hasPrevPage, hasNextPage:products.hasNextPage, prevLink:prevLink, nextLink:nextLink};

        return products;
    }

    //Vistas de los productos
    getProductsViews =async ()=>{
        try {
            return await productModel.find().lean();
        } catch (error) {
            return error
        }
    }

      
      

    //Agrega el producto a la coleccion de la nube
    addProduct = async(obj)=> {
        try{
            await productModel.create(obj)
            return await productModel.findOne({title:obj.title});
       }catch (err){
            return err;
       }
     
    }
    

    
    //Actualiza el producto segun su id en la nube
    updateProduct=async(id, product)=>{
     try {
          if (this.validateId(id)) {   
              if (await this.getProductById(id)) {
                  await productModel.updateOne({_id:id}, product);
                  console.log("Product updated!");
      
                  return true;
              }
          }
          
          return false;
      } catch (error) {
          console.log("Not found!");
  
          return false;
      }
      }
 

    //Borra el producto de la base de datos en la nube segun el id 
    deleteProduct=async(id)=>{
     try {
          if (this.validateId(id)) {    
              if (await this.getProductById(id)) {
                  await productModel.deleteOne({_id:id});
                  console.log("Product deleted!");
  
                  return true;
              }
          }

          return false;
      } catch (error) {
          console.log("Not found!");
  
          return false;
      }
      }
    
    //Busca el producto por el id en la coleccion de la nube
    getProductsById= async(id)=>{
     try {
          return await productModel.findById(id).lean();
          
      } catch (err) {
          return {error: err.message}
      }
  
    }

    getProductByID= async(pid)=>{
     return productModel.find({_id:pid}).lean();
    }

    async getProductById(id) {
      
     return await productModel.findOne({_id:id}).lean() || null;

   

}



    validateId(id) {
     return id.length === 24 ? true : false;
 }

}






