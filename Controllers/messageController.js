import Message from "../Models/message.js";
import User from "../Models/user.js";

export async function sendMessage(req, res) {
    try {
        const { receiverId, message } = req.body;

        if(!req.user){
            res.status(403).json({ error: "You must be logged in to send messages" });
            return;
        }

        if(!receiverId || ! message){
            return res.status(400).json({ error: "Receiver ID and message are required" });
        }

        const receiverExists = await User.findById(receiverId);
        if(!receiverExists){
            return res.status(404).json({ error: "Receiver not found" });
        }

        const newMessage = new Message({
            sender: req.user._id,
            receiver: receiverId,
            message
        });

        await newMessage.save();
        res.json({ message: "Message sent successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send message" });
    }
}

export async function getMessages(req, res) {
    try {
        if(!req.user){
            return res.status(403).json({ error: "You must be logged in to view messages" });
        }
        const messages = await Message.find({
            $or: [
                { sender: req.user._id },
                { receiver: req.user._id }
            ]
        }).populate('sender receiver');
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve messages" });
    }
}

export async function deleteMessage(req, res) {
    try {
        if(!req.user){
            return res.status(403).json({ error: "You must be logged in to delete messages" });
        }
        const messageId = req.params.id;
        const message = await Message.findById(messageId);
        if(!message){
            return res.status(404).json({ error: "Message not found" });
        }
        if(message.sender.toString() !== req.user._id.toString() && message.receiver.toString() !== req.user._id.toString()){
            return res.status(403).json({ error: "You can only delete your own messages" });
        }
        await Message.findByIdAndDelete(messageId);
        res.json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete message" });
    }
}

export async function markMessageRead(req, res) {
    try {
        if(!req.user){
            return res.status(403).json({ error: "You must be logged in to mark messages as read" });
        }
        const messageId = req.params.id;
        const message = await Message.findById(messageId);
        if(!message){
            return res.status(404).json({ error: "Message not found" });
        }
        if(message.receiver.toString() !== req.user._id.toString()){
            return res.status(403).json({ error: "You can only mark your own received messages as read" });
        }
        message.isRead = true;
        await message.save();
        res.json({ message: "Message marked as read" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to mark message as read" });
    }
}

    