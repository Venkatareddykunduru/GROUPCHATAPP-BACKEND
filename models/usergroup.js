const {DataTypes}=require('sequelize');

const sequelize=require('../util/database.js');

const UserGroup = sequelize.define('usergroup', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    isadmin:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    
});

module.exports=UserGroup;