import mongoose from "mongoose";

const diseasesCategorySchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "This Disease Category MUST have a name"],
			unique: true,
		},
		description: {
			type: String,
			required: [true, "This Disease Category MUST have a description"],
			maxLength: [400, "Description MUST NOT exceed 400 characters"],
		},
		rank: {
			type: String,
			required: [true, "This Disease Category MUST have a rank"],
			enum: ["critical", "severe", "moderate", "mild"],
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("DiseasesCategory", diseasesCategorySchema);
