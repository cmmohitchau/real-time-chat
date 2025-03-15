import { Response } from "express";
import { CustomRequest } from "../middleware/authMiddleware.js";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
import cloudinary from "../lib/cloudinary.js";
import { clients } from "../index.js";

export const getUsersForSidebar = async (req: CustomRequest, res: Response): Promise<any> => {
  try {
    const loggedInUserId = req.user?._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (e) {
    console.log("Error in getUsersForSidebar:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessage = async (req: CustomRequest, res: Response): Promise<any> => {
  try {
    const receiverId = req.params.id;
    const myId = req.user?._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: receiverId },
        { senderId: receiverId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessage controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req: CustomRequest, res: Response): Promise<any> => {
  try {
    const { text, image } = req.body;
    const { id } = req.params;
    const senderId = req.user._id.toString();

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId: id,
      text,
      image: imageUrl,
      read: false, // Explicitly set as unread
    });
    await newMessage.save();

    const recipientWs = clients.get(id);
    if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
      recipientWs.send(
        JSON.stringify({
          sender: senderId,
          content: text || imageUrl,
          image: imageUrl || undefined,
          timestamp: newMessage.createdAt,
        })
      );
    }

    const senderWs = clients.get(senderId);
    if (senderWs && senderWs.readyState === WebSocket.OPEN) {
      senderWs.send(
        JSON.stringify({
          sender: senderId,
          content: text || imageUrl,
          image: imageUrl || undefined,
          timestamp: newMessage.createdAt,
        })
      );
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// New endpoint to mark messages as read
export const markMessagesAsRead = async (req: CustomRequest, res: Response): Promise<any> => {
  try {
    const { id: senderId } = req.params; // Sender of the messages being read
    const receiverId = req.user?._id;

    await Message.updateMany(
      { senderId, receiverId, read: false },
      { $set: { read: true } }
    );

    const updatedMessages = await Message.find({
      senderId,
      receiverId,
    }).sort({ createdAt: 1 });

    res.status(200).json(updatedMessages);
  } catch (error) {
    console.log("Error in markMessagesAsRead controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
