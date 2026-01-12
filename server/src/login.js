import { getDatabaseConnection} from "./Database/db.js";
import bcrypt from "bcryptjs"

export async function login(req, res){
    const db = await getDatabaseConnection();
    try {
        const {username, password} = req.body;

        if(!username || !password){
            return res.status(400).json({error: 'Enter required fields'})
        }
        const user = await db.get(`SELECT * FROM users WHERE username = ?`, 
            [username]
        )
        if (!user){
            return res.status(400).json({error: 'User credentials invalid'})
        } 
        const isValidPass = await bcrypt.compare(password, user.password)
        if(!isValidPass){
            return res.status(400).json({error: 'User credentials invalid'})
        }
        res.status(200).json({message: 'login successful',
            user:{id: user.id, username: user.username, email: user.email, name: user.name}
        })
    
    }catch(err){
        res.status(500).json({error: 'Failed to login', details: err.message})
    }finally{
        await db.close()
    }
}