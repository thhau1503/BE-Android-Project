const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        content: {
            type: String,
        },
        attachments: [{
            url: String,
            type: {
                type: String,
                enum: ['image', 'video', 'file']
            }
        }],
        readBy: [{  
            type: Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    {
        timestamps: true,
    }
);
messageSchema.index({ chatId: 1 }); 
messageSchema.index({ chatId: 1, createdAt: -1 }); 
messageSchema.index({ sender: 1 });
module.exports = mongoose.model("Message", messageSchema);