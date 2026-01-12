import bcrypt from "bcryptjs"
import { getDatabaseConnection } from "../Database/db.js" 

export async function registerUser(req, res){
    
    const db = await getDatabaseConnection()
    try {
        let {username, name, email, password} = req.body

        name = name?.trim()
        username = username?.trim()
        email = email?.trim()

        //validate input
        if (!username || !name ||!email || !password){
            return res.status(400).json({error: 'Enter required fields'})
        }
        //hash password
        const hashedpassword = await bcrypt.hash(password, 10)
        //insert in database
        const result = await db.run(
            `INSERT INTO users (username, name, email, password)
            VALUES(?,?,?,?)`,
                [username, name, email, hashedpassword]
        )
        res.status(201).json({message: 'user register success',
            user: {
                id: result.lastID,
                username,
                email
            }
        })

    }catch(err){
        //check for unique constraint
        res.status(500).json({error: 'Failed to register user', details: err.message})
    }finally{
        await db.close()
    }
}

