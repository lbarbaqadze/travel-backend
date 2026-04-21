import dbconnect from "../config/dbconnect.js"

export const createBooking = async (req, res) => {
    const { email, cartItems, phone, notes } = req.body;
    const userEmail = email?.trim().toLowerCase();

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }

    try {
        const tourIds = cartItems.map(item => item.id);

        const [existingOrders] = await dbconnect.execute(
            `SELECT tour_id FROM orders WHERE user_email = ? AND status != 'cancelled'`,
            [userEmail]
        );     

        const alreadyBooked = cartItems.filter(cartItem => {
            return existingOrders.some(order => {
                const isMatch = Number(order.tour_id) === Number(cartItem.id);
                return isMatch;
            });
        });

        if (alreadyBooked.length > 0) {
            const titles = alreadyBooked.map(i => i.location || i.title).join(", ");
            return res.status(400).json({
                message: `"${titles}" You already have a reservation.!`
            });
        }

        for (const item of cartItems) {
            await dbconnect.execute(
                `INSERT INTO orders 
                (user_email, tour_id, tour_title, total_price, phone, special_requirements, status) 
                VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
                [userEmail, item.id, item.location || item.title, item.price, phone, notes]
            );
        }

        await dbconnect.execute(
            'DELETE FROM cart WHERE user_id = (SELECT id FROM users WHERE email = ? LIMIT 1)',
            [userEmail]
        );

        return res.status(201).json({ message: "Booking successful!" });

    } catch (error) {
        console.error("DATABASE ERROR:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};