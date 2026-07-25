import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const tableSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        tableNumber: {
            type: Number,
            required: true,
        },

        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },

        capacity: {
            type: Number,
            required: true,
            min: 1,
        },

        status: {
            type: String,
            enum: ["available", "occupied"],
            default: "available",
        },

        qrCode: {
            type: String,
            unique: true,
            default: () => uuidv4(),
        },
    },
    {
        timestamps: true,
    }
);

/* ================================
   Indexes
================================ */
tableSchema.index({ shopId: 1 });
tableSchema.index({ qrCode: 1 });
tableSchema.index({ shopId: 1, tableNumber: 1 }, { unique: true });

export default mongoose.model("Table", tableSchema);
