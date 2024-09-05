const bcrypt =  require('bcryptjs');
const User = require('./models/user')

//Storing Users details 
let users = [];

//adding new Users
async function addUser(firstname,lastname,username,email,password){
    const hashedPassword = bcrypt.hashSync(password,10);
   const user = new User({
    firstname,
    lastname,
    username,
    email,
    password:hashedPassword});
   try{
    await user.save();
    console.log('User added successfully')
   }
   catch(error){
    console.error("error",error)
   }
}
//finding Existing Users
async function findUser(email){
    try{
        const user= await User.findOne({email}).exec()
        return user;
}catch(error){
    console.error('Error',error)
    return null;
}
}

module.exports = { addUser,findUser};