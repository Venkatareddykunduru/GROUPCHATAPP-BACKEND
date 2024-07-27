const express=require('express');
const cors=require('cors');
const bodyparser=require('body-parser');
const sequelize=require('./util/database');
const userauthroutes=require('./routes/user');
const User=require('./models/user');

const app=express();
app.use(cors());
app.use(bodyparser.json());

//associations

//routes
app.use('/auth',userauthroutes);


(async () => {
    try {
        await sequelize.sync();
        app.listen(process.env.PORT, () => {
            console.log(`Server is listening on port ${process.env.PORT}`);
        });
    } catch (err) {
        console.log('Unable to start server : '+err);
    }
})();