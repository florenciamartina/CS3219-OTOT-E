import mongoose from "mongoose";

var Schema = mongoose.Schema;
let ModuleSchema = new Schema({
  ay: {
    type: String,
    required: true,
    unique: true,
  },
  modules: {
    type: [{ type: Object }],
  },
});

export default mongoose.model("nusmods", ModuleSchema);
