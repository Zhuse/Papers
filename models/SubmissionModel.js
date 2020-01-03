const mongoose = require('mongoose');

const { Schema } = mongoose;

const SubmissionSchema = new Schema({
  language_id: { type: Number, required: true },
  source_code: { type: String, required: true },
  user: { type: Schema.ObjectId, ref: 'User', required: true },
  time: { type: Number, default: null},
  memory: { type: Number, default: null},
  stderr: { type: String, default: null},
  stdout: { type: String, default: null},
  token: { type: String, required: true},
  compile_output: {type: String, default: null},
  message: { type: String, default: null},
  status: {
      id: { type: Number, required: true},
      description: { type: String, required: true}
  }
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);