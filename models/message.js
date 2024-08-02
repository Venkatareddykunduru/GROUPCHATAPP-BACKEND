const {DataTypes}=require('sequelize');

const sequelize=require('../util/database.js');

const Message = sequelize.define('message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    content:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    type:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:'noturl'
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false
    },
    filename:{
        type:DataTypes.STRING
    }
    
});

module.exports=Message;