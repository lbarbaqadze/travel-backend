import { createPool } from "mysql2"
import dotenv from "dotenv"

dotenv.config()

const dbconnect = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 4000,
    ssl: {
    rejectUnauthorized: false 
    },
    waitForConnections: true,
    connectionLimit: 10,
    queryFormat: 0
})

dbconnect.getConnection((error, connect) => {
    if(error){
        console.log("ბაზა ვერ დაუკავშირდა სერვერს", error)
    }else{
        console.log("ბაზა წარმატებით დაუკავშირდა")
        connect.release()
    }
})

export default dbconnect.promise()