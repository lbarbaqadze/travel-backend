import dbconnect from "../config/dbconnect.js";

export const addToCart = async (req, res) => {
    const { tour_id, tour_category } = req.body;
    const user_id = req.user.id;

    try {
        const [exists] = await dbconnect.execute(
            "SELECT id FROM cart WHERE user_id = ? AND tour_id = ? AND tour_category = ?",
            [user_id, tour_id, tour_category]
        );

        if (exists.length > 0) {
            return res.status(400).json({ message: "Already in bag" });
        }

        const [result] = await dbconnect.execute(
            "INSERT INTO cart (user_id, tour_id, tour_category) VALUES (?, ?, ?)",
            [user_id, tour_id, tour_category]
        );
        return res.status(200).json({ message: "Added successfully", cart_id: result.insertId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getCart = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await dbconnect.execute(
            `SELECT 
                c.id AS cart_id, 
                c.tour_id,
                c.tour_category,
                CASE 
                    WHEN c.tour_category = 'europe' THEN e.location
                    WHEN c.tour_category = 'asia' THEN a.location
                    ELSE t.location 
                END AS location,
                CASE 
                    WHEN c.tour_category = 'europe' THEN e.price
                    WHEN c.tour_category = 'asia' THEN a.price
                    ELSE t.price 
                END AS price,
                CASE 
                    WHEN c.tour_category = 'europe' THEN e.image_url
                    WHEN c.tour_category = 'asia' THEN a.image_url
                    ELSE t.image_url 
                END AS image_url
             FROM cart c
             LEFT JOIN europe e ON c.tour_id = e.id AND c.tour_category = 'europe'
             LEFT JOIN asia a ON c.tour_id = a.id AND c.tour_category = 'asia'
             LEFT JOIN tours t ON c.tour_id = t.id AND c.tour_category = 'tours'
             WHERE c.user_id = ?`,
            [userId]
        );
        return res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json([]);
    }
};

export const removeCart = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    try {
        await dbconnect.execute("DELETE FROM cart WHERE id = ? AND user_id = ?", [id, user_id]);
        return res.status(200).json({ message: "Deleted" });
    } catch (err) {
        return res.status(500).json({ message: "Error" });
    }
};