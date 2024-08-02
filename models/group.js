const {DataTypes}=require('sequelize');

const sequelize=require('../util/database.js');

const Group = sequelize.define('group', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    
});

module.exports=Group;