import dbconnect from "../config/dbconnect.js"

export const getTours = async (req, res) => {
    try{
        const [tours] = await dbconnect.execute('SELECT * FROM tours')
        res.status(200).json(tours)
    }catch(err){
        res.status(500).json({message: "Data not received."})
    }
}

export const getEuropeTours = async (req, res) => {
    try{
        const [tours] = await dbconnect.execute('SELECT * FROM europe')
        res.status(200).json(tours)
    }catch(err){
        res.status(500).json({message: "Data not received."})
    }
}

export const getAsiaTours = async (req, res) => {
    try{
        const [tours] = await dbconnect.execute('SELECT * FROM asia')
        res.status(200).json(tours)
    }catch(err){
        res.status(500).json({message: "Data not received."})
    }
}

export const getSingleTours = async (req, res) => {
    const { id } = req.params;
    
    const category = req.query.category; 

    try {
        let tableName = "tours"; 
        if (category === "europe") tableName = "europe";
        if (category === "asia") tableName = "asia";

        const [rows] = await dbconnect.execute(
            `SELECT * FROM ${tableName} WHERE id = ?`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Tour data not found" });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("DATABASE ERROR:", error);
        res.status(500).json({ message: "server error" });
    }
};

export const createOrder = async (req, res) => {
    const {email, items, total} = req.body
}