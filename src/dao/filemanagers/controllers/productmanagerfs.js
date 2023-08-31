import { error } from "console";
import fs from "fs"

export default class ProductManager {
    constructor(path) {
        this.path= path;
        
    }
    
     //Muestra los objetos en el json y determina el limite 
     getProducts=async(info)=>{
        const productList= await fs.promises.readFile(this.path,"utf-8")
        const productListParse=JSON.parse(productList)
        return productListParse
      }
    //Consigue el id
    getId= async()=> {
        if (fs.existsSync(this.path)){
            const listP = await this.getProducts({});
            const cod = listP.length
        if(cod == 0){
            return 1
        } else {
            return (listP[cod-1].id)+1
        }
        }
        
    }
    //Agrega el producto, validando ya sus campos y comprobando si su codigo esta en uso previamente
    addProduct = async(obj)=> {
        const {title,description,price,thumbnail,category, status= true, code,stock} =obj;
        if(title===undefined||description===undefined||price===undefined||category===undefined||thumbnail===undefined||code===undefined||stock===undefined){
            console.error("Campos incompletos")
            return
        } else {
            const all = await this.getProducts() 
            const codigoEnUso = all.find(item => item.code === code)
            if(codigoEnUso){
                console.error("Codigo en uso")
            } else {
                const id =await this.getId()
                const producto = {id,title,description,price,thumbnail,category, status,code,stock};
                    all.push(producto);
                    await fs.promises.writeFile(this.path, JSON.stringify(all, null,2))
                }
        }
    }
    

    
    //Actualiza el producto segun su id comprobando si esta completo y si su codigo esta o no en uso
    updateProduct=async(id,obj)=>{
        const {title,description,price,thumbnail,category, status= true, code,stock} =obj;
        const {pid}= id;
                if(title===undefined||description===undefined||price===undefined||category===undefined||thumbnail===undefined||code===undefined||stock===undefined){
          console.error("INGRESE TODOS LOS DATOS DEL PRODUCTO PARA SU ACTUALIZACION")
          return 
        }
        else{
            const allP=await this.getProducts({})
            const codigoEnUso=allP.find(elemento=>elemento.code===code)
            if(codigoEnUso){
                 console.error("EL CODIGO DEL PRODUCTO QUE DESEA ACTUALIZAR ES REPETIDO")
                 return
            }
            else{
               
                const newProductsList=allP.map(elemento=>{
                    if(elemento.id===id){
                      const updatedProduct={
                        ...elemento,
                        title,description,price,thumbnail,code,status, category,stock
                      }
                      return updatedProduct
                    }
                    else{
                        return elemento
                    }
                })
                await fs.promises.writeFile(this.path,JSON.stringify(newProductsList,null,2))
            }
            
        }
      }
 

    //Borra el producto segun el id
    deleteProduct=async(pid)=>{
        const allproducts=await this.getProducts({})
        const productswithoutfound=allproducts.filter(elemento=>elemento.id!==parseInt(pid))
        await fs.promises.writeFile(this.path,JSON.stringify(productswithoutfound,null,2))
      }
    
    //Busca el producto por el id
    getProductsById= async(id)=>{
        const {pid}=id;
        const allProducts = await this.getProducts({});
        const findOne = allProducts.find(item => item.id === parseInt(pid));
        if (findOne){
            return findOne
       } else {
        console.error("No se encontro el producto")
       }
    }


}






