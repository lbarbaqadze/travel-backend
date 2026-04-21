import dbconnect from "../config/dbconnect.js"

export const getDashboardStats = async (req, res) => {
    try{

        const [toursCount] = await dbconnect.execute('SELECT COUNT(*) as total FROM tours');
        const [usersCount] = await dbconnect.execute('SELECT COUNT(*) as total FROM users');
        const [messagesCount] = await dbconnect.execute('SELECT COUNT(*) as total FROM contact_messages WHERE status = "new"')

        res.status(200).json({
            tours: toursCount[0].total,
            users: usersCount[0].total,
            messages: messagesCount[0].total,
        });

    }catch(err){
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Failed to retrieve statistics." });    
    }
}

export const getAllTours = async (req, res) => {
    try{
        const [tours] = await dbconnect.execute('SELECT * FROM tours ORDER BY id ASC')
        res.status(200).json(tours)
    }catch(err){
        res.status(500).json({message: "The tours failed to take place."}, err)
    }
}

export const deleteTours = async (req, res) => {
    const { id } = req.params
    try{
        await dbconnect.execute('DELETE FROM tours WHERE id = ?', [id])
        res.status(200).json({message: "Tour successfully deleted."})
    }catch(err){
        res.status(500).json({message: "The tour was not deleted."})
    }
}

export const getSingleTours = async (req, res) => {
    const { id } = req.params;
    try {
        const [tour] = await dbconnect.query('SELECT * FROM tours WHERE id = ?', [id]);
        res.status(200).json(tour[0]);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tour" });
    }
};

export const updateTours = async (req, res) => {
    const { id } = req.params;
    const { title, price, location, duration, description } = req.body;
    try {
        await dbconnect.query(
            'UPDATE tours SET title=?, price=?, location=?, duration=?, description=? WHERE id=?',
            [title, price, location, duration, description, id]
        );
        res.status(200).json({ message: "Tour updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};

export const addTour = async (req, res) => {
    const { title, price, location, duration, description } = req.body;
    
    try {
        const [result] = await dbconnect.query(
            'INSERT INTO tours (title, price, location, duration, description) VALUES (?, ?, ?, ?, ?)',
            [title, price, location, duration, description]
        );
        
        res.status(201).json({ 
            success: true, 
            message: "Tour added successfully", 
            tourId: result.insertId 
        });
    } catch (error) {
        console.error("Add Tour Error:", error);
        res.status(500).json({ message: "Failed to add tour", error });
    }
};

export const getAllMessages = async (req, res) => {
    try {
        const [messages] = await dbconnect.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error });
    }
};

export const deleteMessage = async (req, res) => {
    const { id } = req.params;
    try {
        await dbconnect.query('DELETE FROM contact_messages WHERE id = ?', [id]);
        res.status(200).json({ message: "Message deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting message" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const [users] = await dbconnect.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await dbconnect.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ message: "User removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
};

export const getStats = async (req, res) => {
    try {
        const [tours] = await dbconnect.execute("SELECT COUNT(*) as count FROM tours");
        const [users] = await dbconnect.execute("SELECT COUNT(*) as count FROM users");
        const [messages] = await dbconnect.execute("SELECT COUNT(*) as count FROM contact_messages");

        const [recentMessages] = await dbconnect.execute(
            "SELECT id, sender_name, sender_email, message FROM contact_messages ORDER BY id DESC LIMIT 3"
        );

        const [recentUsers] = await dbconnect.execute(
            "SELECT id, name, email FROM users ORDER BY id DESC LIMIT 5"
        );

        res.status(200).json({
            stats: {
                tours: tours[0].count,
                users: users[0].count,
                messages: messages[0].count
            },
            recentMessages,
            recentUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while retrieving statistics" });
    }
};