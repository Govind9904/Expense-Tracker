const { DataTypes }  =  require('sequelize');
const sequelize = require('../Database/db');


const User = sequelize.define("User",{
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    first_name : {
        type : DataTypes.STRING,
        allowNull : false,
    },
    last_name : {
        type : DataTypes.STRING,
        allowNull : false
    },
    email : {
        type : DataTypes.STRING,
        allowNull : false
    },
    password : {
        type : DataTypes.STRING,
        allowNull : false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
})

module.exports = User;