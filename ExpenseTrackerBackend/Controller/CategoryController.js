const Category = require('../Models/Category');


exports.createCategory = async (req , res ) => {
    try {
        const {categoryName} = req.body;

        const newCategory = await Category.create({
            name : categoryName 
        });

        res.status(201).json({
            message : "Category created successfully",
            category : newCategory
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({ error : "Server Error"});
    }
}


exports.getAllCategories = async (req , res) => {
    try{
        const categories = await Category.findAll();

        res.status(200).json({
         categories : categories
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({ error : "Server Error"});
    }
}